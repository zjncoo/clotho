/**
 * Robust Client-Side AI Background Remover with @imgly/background-removal
 * Configured with explicit CDN publicPath for ONNX/WASM models.
 */

export async function removeImageBackground(
  imageSource: Blob | File | string,
  onProgress?: (percent: number, step: string) => void
): Promise<Blob> {
  try {
    if (onProgress) onProgress(5, 'Loading AI model...');

    // Load ESM dynamic module without Webpack bundler collision
    const importDynamic = new Function('url', 'return import(url)');
    const { removeBackground } = await importDynamic(
      'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm'
    );

    if (onProgress) onProgress(15, 'Removing background...');

    const blob = await removeBackground(imageSource, {
      publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.4.5/dist/',
      model: 'small', // small model is faster and uses less RAM on mobile devices
      progress: (key: string, current: number, total: number) => {
        if (total > 0 && onProgress) {
          const pct = Math.round((current / total) * 100);
          onProgress(pct, `AI Processing: ${pct}%`);
        }
      },
    });

    if (onProgress) onProgress(100, 'Done');
    return blob;
  } catch (error) {
    console.warn('AI background removal error, falling back to smart color keying:', error);
    // If AI fails due to network or WebAssembly memory limits, apply smart canvas background removal
    return await fallbackCanvasBackgroundRemoval(imageSource);
  }
}

/**
 * Smart Canvas Fallback: Detects solid / near-white or uniform studio background corners
 * and keys out the outer background with feathered alpha.
 */
async function fallbackCanvasBackgroundRemoval(imageSource: Blob | File | string): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        if (typeof imageSource !== 'string') URL.revokeObjectURL(url);
        return resolve(imageSource instanceof Blob ? imageSource : new Blob());
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample corner pixels to determine background color
      const sampleCorners = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
      ];

      let bgR = 0;
      let bgG = 0;
      let bgB = 0;

      for (const [cx, cy] of sampleCorners) {
        const idx = (cy * w + cx) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      }

      bgR /= sampleCorners.length;
      bgG /= sampleCorners.length;
      bgB /= sampleCorners.length;

      // If corner is relatively light (white, grey, light studio background), key out similar pixels
      const threshold = 38;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
        if (dist < threshold) {
          data[i + 3] = 0; // make transparent
        } else if (dist < threshold + 15) {
          data[i + 3] = Math.round(((dist - threshold) / 15) * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (typeof imageSource !== 'string') URL.revokeObjectURL(url);
          resolve(blob || (imageSource instanceof Blob ? imageSource : new Blob()));
        },
        'image/png'
      );
    };

    img.onerror = () => {
      if (typeof imageSource !== 'string') URL.revokeObjectURL(url);
      resolve(imageSource instanceof Blob ? imageSource : new Blob());
    };

    img.src = url;
  });
}
