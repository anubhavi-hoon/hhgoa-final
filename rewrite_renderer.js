const fs = require('fs');

const content = fs.readFileSync('src/lib/renderer.ts', 'utf8');

// Find the start of renderCard
const startIdx = content.indexOf('export async function renderCard(');
if (startIdx === -1) throw new Error("Could not find renderCard");

// Find the end of renderCard (which is before canvasToBlob)
const endIdx = content.indexOf('export function canvasToBlob(');
if (endIdx === -1) throw new Error("Could not find canvasToBlob");

// Construct the new renderCard function
const newRenderCard = `export async function renderCard(
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

  // 1. Load and draw the master flat template background
  const templateImg = await loadImage(config.assets.templatePath);
  ctx.drawImage(templateImg, 0, 0, config.width, config.height);

  // 2. Draw user photo masked to the checkerboard placeholder
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
      // Clip to photo box (with rounded corners)
      roundRect(ctx, pb.x, pb.y, pb.width, pb.height, 12); // Slightly larger radius
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
      
      // Draw inner border for depth
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 2;
      roundRect(ctx, pb.x, pb.y, pb.width, pb.height, 12);
      ctx.stroke();
    } catch (err) {
      console.error('Error rendering user image on canvas:', err);
    }
  }

  // 3. Draw Name Text
  const np = config.namePosition;
  ctx.fillStyle = '#181816';
  ctx.font = \`bold \${np.fontSize}px Caveat, Permanent Marker, Brush Script MT, Pacifico, cursive\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.name || 'Aryan Dev', np.x, np.y);

  // 4. Draw Role Text (Overlaying the existing dark blue banner)
  // We can either draw a new dark blue banner or just text.
  // The new template has a banner already. Let's just draw the text on top.
  const rp = config.rolePosition;
  
  // Optional: We could draw a background here if we want to cover any baked-in text,
  // but it's empty in the template.
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = \`bold \${rp.fontSize}px JetBrains Mono, Courier New, monospace\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const roleText = \`\${options.role.toUpperCase() || 'FULL STACK DEVELOPER'}\`;
  
  // Notice in the template it already has \`<     />\` brackets baked in,
  // we just need to put the text in the middle.
  ctx.fillText(roleText, rp.x + rp.width / 2, rp.y + rp.height / 2);

  return canvas;
}

/**
 * Converts a HTMLCanvasElement to a Blob.
 */
`;

const newContent = content.slice(0, startIdx) + newRenderCard + content.slice(endIdx + 72); // 72 is length of the comment/export line? No, just replace up to endIdx.
const finalContent = content.slice(0, startIdx) + newRenderCard + content.slice(endIdx);

fs.writeFileSync('src/lib/renderer.ts', finalContent);
console.log('Renderer updated');
