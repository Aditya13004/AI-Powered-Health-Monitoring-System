const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js';
const PDFJS_VERSION = '4.4.168';

/** Preprocess image using Canvas for better OCR (grayscale, contrast, brightness) */
export async function preprocessImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      // Apply grayscale, contrast and brightness to enhance text clarity
      ctx.filter = 'grayscale(100%) contrast(150%) brightness(110%)';
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Render first page of a PDF to a canvas Blob using pdf.js from CDN */
export async function pdfToImageBlob(file) {
  const pdfjsLib = await import(
    /* @vite-ignore */
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 }); // 2× for better OCR

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Dynamically load Tesseract.js from CDN and run OCR on an image File/Blob */
export async function runTesseractOcr(imageInput, onProgress) {
  const mod = await import(/* @vite-ignore */ TESSERACT_CDN);
  // CDN ESM bundles expose exports on .default
  const Tesseract = mod.default || mod;

  if (typeof Tesseract.recognize !== 'function' && typeof Tesseract.createWorker !== 'function') {
    throw new Error('Tesseract.js failed to load from CDN. Please check your internet connection.');
  }

  // Use createWorker for progress tracking
  const createWorker = Tesseract.createWorker;
  const worker = await createWorker('eng', 1, {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 90));
      }
    },
  });

  try {
    const result = await worker.recognize(imageInput);
    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
    };
  } finally {
    // Always terminate worker to prevent memory leaks
    await worker.terminate().catch(() => {});
  }
}
