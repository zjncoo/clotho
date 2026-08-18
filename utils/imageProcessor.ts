import { COLOR_PALETTE } from './colorPalette';

export async function processAndCompressImage(
  blob: Blob,
  quality: number = 0.82,
  maxDimension: number = 800
): Promise<{ webpBase64: string; dominantColor: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        return reject(new Error('Canvas non disponibile'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      const { data } = ctx.getImageData(0, 0, width, height);
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 130) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }

      let dominantColor = 'N/D';
      if (count > 0) {
        const avgR = r / count;
        const avgG = g / count;
        const avgB = b / count;

        let minDistance = Infinity;
        for (const col of COLOR_PALETTE) {
          const dist = Math.hypot(avgR - col.rgb[0], avgG - col.rgb[1], avgB - col.rgb[2]);
          if (dist < minDistance) {
            minDistance = dist;
            dominantColor = col.name;
          }
        }
      }

      const webpBase64 = canvas.toDataURL('image/webp', quality);
      resolve({ webpBase64, dominantColor });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
  });
}
