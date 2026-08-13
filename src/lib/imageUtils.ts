/**
 * Converts a HEIC/HEIF image File to a PNG File on the client-side.
 * Dynamically imports 'heic2any' to prevent Next.js SSR build errors.
 */
export async function convertHeicToPng(file: File): Promise<File> {
  if (typeof window === 'undefined') return file;

  const fileName = file.name.toLowerCase();
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif');

  if (!isHeic) return file;

  try {
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default;

    const blob = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 0.9,
    });

    const resultBlob = Array.isArray(blob) ? blob[0] : blob;
    const newName = file.name.replace(/\.(heic|heif)$/i, '.png');

    return new File([resultBlob], newName, { type: 'image/png' });
  } catch (error) {
    console.error('Failed to convert HEIC image:', error);
    return file; // Fallback to original file
  }
}

interface CropResult {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

/**
 * Calculates source crop coordinates (sx, sy, sWidth, sHeight)
 * to fill a destination bounding box (boxWidth, boxHeight) with a 'cover' scale style,
 * and overlays custom zoom and panning offsets.
 * 
 * @param imgWidth Source image width
 * @param imgHeight Source image height
 * @param boxWidth Target destination box width
 * @param boxHeight Target destination box height
 * @param zoom Zoom multiplier (1.0 = default cover fit, > 1.0 = zoom in)
 * @param offsetX Horizontal pan offset (-1.0 to 1.0, where 0.0 is center)
 * @param offsetY Vertical pan offset (-1.0 to 1.0, where 0.0 is center)
 */
export function calculateCoverCrop(
  imgWidth: number,
  imgHeight: number,
  boxWidth: number,
  boxHeight: number,
  zoom: number = 1,
  offsetX: number = 0,
  offsetY: number = 0
): CropResult {
  const targetRatio = boxWidth / boxHeight;
  const imageRatio = imgWidth / imgHeight;

  let sWidth = imgWidth;
  let sHeight = imgHeight;

  // Determine initial cover dimensions (maximum crop area covering target ratio)
  if (imageRatio > targetRatio) {
    // Image is wider than the target box, crop width
    sWidth = imgHeight * targetRatio;
  } else {
    // Image is taller than the target box, crop height
    sHeight = imgWidth / targetRatio;
  }

  // Apply zoom factor. Zooming in means shrinking the crop area.
  const z = Math.max(1, zoom);
  sWidth = sWidth / z;
  sHeight = sHeight / z;

  // Center coordinates of the crop box
  let sx = (imgWidth - sWidth) / 2;
  let sy = (imgHeight - sHeight) / 2;

  // Panning movement range
  const rangeX = imgWidth - sWidth;
  const rangeY = imgHeight - sHeight;

  // Apply offset. Offsets are [-1, 1] relative sliders.
  // Shift center position by (offset * range / 2)
  if (rangeX > 0) {
    sx += (offsetX * rangeX) / 2;
  }
  if (rangeY > 0) {
    sy += (offsetY * rangeY) / 2;
  }

  // Clamp crop box inside the image boundaries
  sx = Math.max(0, Math.min(imgWidth - sWidth, sx));
  sy = Math.max(0, Math.min(imgHeight - sHeight, sy));

  return {
    sx,
    sy,
    sWidth,
    sHeight,
  };
}

/**
 * Loads an image from a source URL and returns a Promise.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
