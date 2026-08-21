import { COLOR_PALETTE } from './colorPalette';

export async function processAndCompressImage(
  blob: Blob,
  quality: number = 0.88,
  maxDimension: number = 900
): Promise<{ webpBase64: string; dominantColor: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);

      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;

      // 1. Disegna l'immagine su un canvas temporaneo ad alta fedeltà
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = srcW;
      tempCanvas.height = srcH;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

      if (!tempCtx) {
        return reject(new Error('Canvas non disponibile'));
      }

      tempCtx.drawImage(img, 0, 0);
      const imgData = tempCtx.getImageData(0, 0, srcW, srcH);
      const { data } = imgData;

      // 2. Trova il Bounding Box dei pixel non trasparenti (Auto-trimming bordi vuoti)
      let minX = srcW, minY = srcH, maxX = 0, maxY = 0;
      let hasTransparency = false;
      let r = 0, g = 0, b = 0, count = 0;

      for (let y = 0; y < srcH; y++) {
        for (let x = 0; x < srcW; x++) {
          const idx = (y * srcW + x) * 4;
          const alpha = data[idx + 3];

          if (alpha < 250) {
            hasTransparency = true;
          }

          if (alpha > 25) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;

            if (alpha > 120) {
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              count++;
            }
          }
        }
      }

      // Se l'immagine ha bordi trasparenti, ritaglia esattamente il soggetto
      let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;
      if (hasTransparency && maxX >= minX && maxY >= minY) {
        const padding = Math.max(8, Math.round(Math.min(srcW, srcH) * 0.02));
        cropX = Math.max(0, minX - padding);
        cropY = Math.max(0, minY - padding);
        cropW = Math.min(srcW - cropX, (maxX - minX + 1) + padding * 2);
        cropH = Math.min(srcH - cropY, (maxY - minY + 1) + padding * 2);
      }

      // 3. Ridimensiona proporzionalmente entro maxDimension
      let targetW = cropW;
      let targetH = cropH;
      if (targetW > targetH && targetW > maxDimension) {
        targetH = Math.round((targetH * maxDimension) / targetW);
        targetW = maxDimension;
      } else if (targetH > maxDimension) {
        targetW = Math.round((targetW * maxDimension) / targetH);
        targetH = maxDimension;
      }

      const outCanvas = document.createElement('canvas');
      outCanvas.width = targetW;
      outCanvas.height = targetH;
      const outCtx = outCanvas.getContext('2d');

      if (!outCtx) {
        return reject(new Error('Canvas output non disponibile'));
      }

      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = 'high';
      outCtx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

      // 4. Calcolo del colore dominante più vicino alla palette
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

      // 5. Esportazione in WebP con fallback PNG (supporto trasparenza)
      let webpBase64 = outCanvas.toDataURL('image/webp', quality);
      if (!webpBase64.startsWith('data:image/webp')) {
        webpBase64 = outCanvas.toDataURL('image/png');
      }

      resolve({ webpBase64, dominantColor });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
  });
}
