import { calculateCoverCrop, loadImage } from './imageUtils';

export interface RenderOptions {
  photo: string | null; // Data URL or Image Object source
  name: string;
  role: string;
  builderTitle: string;
  zoom: number;
  offsetX: number; // -1 to 1
  offsetY: number; // -1 to 1
}

export interface TemplateConfig {
  width: number;
  height: number;
  photoBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number; // degrees
  };
  namePosition: {
    x: number;
    y: number;
    fontSize: number;
  };
  rolePosition: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
  };
  assets: {
    templatePath: string;
  };
}

export const CLASSIC_TEMPLATE: TemplateConfig = {
  width: 1080,
  height: 1620,
  photoBox: {
    // Precisely measured: checkerboard spans x=186-515, y=400-826 in 681x1024 source
    // Scaled to 1080x1620: x=295, y=633, w=522, h=674
    x: 295,
    y: 633,
    width: 522,
    height: 674,
    rotation: 0,
  },
  namePosition: {
    // Cream area between checkerboard bottom (y=1307) and dark bar top (y=1334)
    // Center: ~1320
    x: 556,  // center of photoBox: 295 + 522/2
    y: 1300,
    fontSize: 48,
  },
  rolePosition: {
    // Dark blue bar: source y=843-883 → scaled y=1334-1397
    x: 295,
    y: 1334,
    width: 522,
    height: 63,
    fontSize: 20,
  },
  assets: {
    templatePath: '/templates/classic/template_v3.jpg',
  },
};

/**
 * Helper to draw a rounded rectangle on a canvas path.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
) {
  ctx.beginPath();
  if (typeof radius === 'number') {
    radius = [radius, radius, radius, radius];
  }
  const [tl, tr, br, bl] = radius;
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

/**
 * Renders the full 1080x1620 card using HTML5 Canvas API.
 * Uses a flat template image as the background and overlays user photo + text.
 */
export async function renderCard(
  options: RenderOptions,
  config: TemplateConfig = CLASSIC_TEMPLATE
): Promise<HTMLCanvasElement> {
  // Ensure fonts are loaded before drawing
  if (typeof window !== 'undefined') {
    await document.fonts.ready;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D rendering context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw the full template image as background (all design elements are baked in)
  const templateImg = await loadImage(config.assets.templatePath);
  ctx.drawImage(templateImg, 0, 0, config.width, config.height);

  // 2. Draw user photo over the checkerboard placeholder
  const pb = config.photoBox;
  if (options.photo) {
    try {
      const userImg = await loadImage(options.photo);

      const crop = calculateCoverCrop(
        userImg.width,
        userImg.height,
        pb.width,
        pb.height,
        options.zoom,
        options.offsetX,
        options.offsetY
      );

      ctx.save();
      roundRect(ctx, pb.x, pb.y, pb.width, pb.height, 8);
      ctx.clip();

      ctx.drawImage(
        userImg,
        crop.sx,
        crop.sy,
        crop.sWidth,
        crop.sHeight,
        pb.x,
        pb.y,
        pb.width,
        pb.height
      );
      ctx.restore();
    } catch (err) {
      console.error('Error rendering user image on canvas:', err);
    }
  } else {
    // Draw placeholder over the checkerboard
    ctx.fillStyle = '#EBE7DF';
    roundRect(ctx, pb.x, pb.y, pb.width, pb.height, 8);
    ctx.fill();

    ctx.fillStyle = '#B4A998';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', pb.x + pb.width / 2, pb.y + pb.height / 2 - 30);

    ctx.font = '16px JetBrains Mono, monospace';
    ctx.fillStyle = '#7E7362';
    ctx.fillText('NO PHOTO SELECTED', pb.x + pb.width / 2, pb.y + pb.height / 2 + 30);
  }

  // 3. Draw Name text in the cream area below the photo
  const np = config.namePosition;
  ctx.fillStyle = '#181816';
  ctx.font = `bold ${np.fontSize}px Caveat, Permanent Marker, Brush Script MT, Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.name || 'Aryan Dev', np.x, np.y);

  // 4. Draw Role text on the dark blue bar
  const rp = config.rolePosition;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${rp.fontSize}px JetBrains Mono, Courier New, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const roleText = `< ${options.role.toUpperCase() || 'FULL STACK DEVELOPER'} />`;
  ctx.fillText(roleText, rp.x + rp.width / 2, rp.y + rp.height / 2);

  return canvas;
}

/**
 * Converts a HTMLCanvasElement to a Blob.
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas to Blob conversion failed'));
      }
    }, 'image/png');
  });
}

/**
 * Converts a HTMLCanvasElement to a Base64 Data URL.
 */
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

/**
 * Downloads a canvas element as a PNG file.
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'hacker-house-goa-2026.png') {
  const dataUrl = canvasToDataURL(canvas);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
