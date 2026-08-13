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
    x: 245,
    y: 430,
    width: 590,
    height: 720, // Inside card boundaries
    rotation: -1.5,
  },
  namePosition: {
    x: 295, // Center relative to card width (590 / 2)
    y: 655, // y position inside the card coordinate system
    fontSize: 72,
  },
  rolePosition: {
    x: 45,  // Margin inside card (590 - 500) / 2
    y: 690, // y position inside card
    width: 500,
    height: 60,
    fontSize: 26,
  },
  assets: {
    templatePath: '/templates/classic/template.png',
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
 * Draws a piece of retro semitransparent tape on the canvas.
 */
function drawTape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  
  // Draw semi-transparent tape body
  ctx.fillStyle = 'rgba(238, 230, 204, 0.45)'; // Semi-transparent yellowish tape
  ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  
  ctx.fillRect(-width / 2, -height / 2, width, height);

  // Draw jagged edges at the ends
  ctx.strokeStyle = 'rgba(220, 210, 180, 0.6)';
  ctx.lineWidth = 1.5;
  
  // Left edge zig-zag
  ctx.beginPath();
  const leftX = -width / 2;
  ctx.moveTo(leftX, -height / 2);
  let side = 1;
  for (let currY = -height / 2; currY <= height / 2; currY += 4) {
    ctx.lineTo(leftX + (side * 2), currY);
    side = -side;
  }
  ctx.stroke();

  // Right edge zig-zag
  ctx.beginPath();
  const rightX = width / 2;
  ctx.moveTo(rightX, -height / 2);
  side = 1;
  for (let currY = -height / 2; currY <= height / 2; currY += 4) {
    ctx.lineTo(rightX - (side * 2), currY);
    side = -side;
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a piece of ripped paper on the canvas for the name tag.
 */
function drawRippedPaper(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.fillStyle = '#FCFBF9'; // Bright cream ripped paper color
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 3;

  ctx.beginPath();
  
  // Start at top-left
  ctx.moveTo(x, y);
  
  // Top edge (jagged)
  let side = 1;
  for (let currX = x; currX <= x + width; currX += 8) {
    ctx.lineTo(currX, y + (side * 2));
    side = -side;
  }
  
  // Right edge (slightly jagged)
  for (let currY = y; currY <= y + height; currY += 6) {
    ctx.lineTo(x + width + (side * 1.5), currY);
    side = -side;
  }
  
  // Bottom edge (jagged)
  for (let currX = x + width; currX >= x; currX -= 8) {
    ctx.lineTo(currX, y + height + (side * 2));
    side = -side;
  }
  
  // Left edge (slightly jagged)
  for (let currY = y + height; currY >= y; currY -= 6) {
    ctx.lineTo(x + (side * 1.5), currY);
    side = -side;
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Draw a very faint gray inner border to give it depth
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Renders the full 1080x1620 card using HTML5 Canvas API.
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

  // Disable image smoothing for retro screen-print pixels/grain feel
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw base solid background color (cream)
  ctx.fillStyle = '#F4EFEB';
  ctx.fillRect(0, 0, config.width, config.height);

  // 2. Draw retro blue grid lines programmatically (graph paper style)
  ctx.strokeStyle = 'rgba(15, 90, 110, 0.05)'; // Very faint teal/blue grid lines
  ctx.lineWidth = 1.5;
  const gridSize = 48;
  for (let x = 0; x < config.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, config.height);
    ctx.stroke();
  }
  for (let y = 0; y < config.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(config.width, y);
    ctx.stroke();
  }

  // 3. Load master template sheet
  const templateImg = await loadImage(config.assets.templatePath);

  // 4. Draw Logo ("HACKER HOUSE GOA") from template
  // Source bounds: x=0, y=0, w=530, h=450
  ctx.drawImage(templateImg, 0, 0, 530, 450, 30, 40, 530 * 1.05, 450 * 1.05);

  // Hide the extra "2026 -" drawn by the logo step (located around y=334)
  ctx.fillStyle = '#F4EFEB';
  ctx.fillRect(115, 320, 90, 45);
  // Hide the tape drawn by the logo step (located around y=395)
  ctx.fillRect(170, 385, 400, 95);

  // 5. Draw Church illustration from template
  // Source bounds: x=530, y=0, w=494, h=530 (top right of template)
  ctx.drawImage(templateImg, 530, 0, 494, 530, 550, 20, 530, 540);

  // 6. Draw Left column elements (Palm leaves, Beach photo, and Dark blue block to fill space)
  // 6a. Palm leaves (upper part, from y=250 to y=700)
  ctx.drawImage(templateImg, 0, 250, 320, 450, -20, 350, 336, 472.5);
  
  // Hide the extra "2026 -" drawn by the 6a palm leaves step (located around y=381)
  ctx.fillStyle = '#F4EFEB';
  ctx.fillRect(60, 370, 90, 45);
  // Hide the tape drawn by the 6a palm leaves step (located around y=442)
  ctx.fillRect(125, 430, 400, 95);
  // 6b. Beach scene (middle part, from y=600 to y=850)
  ctx.drawImage(templateImg, 0, 600, 320, 250, -20, 822, 336, 262.5);
  // 6c. Dark blue/green block (bottom part, from y=850 to y=1024) - stretched to meet footer
  ctx.drawImage(templateImg, 0, 850, 320, 174, -20, 1084, 336, 406);

  // 7. Draw Right column blue block (fills gap between Church and Vespa)
  // Source: x=530, y=510, w=494, h=90 (blue block with dots/grid next to card in template)
  // Destination: x=550, y=560, w=530, h=480
  ctx.drawImage(templateImg, 530, 510, 494, 90, 550, 560, 530, 480);

  // 7b. Draw Vespa scooter illustration from template (drawn in background, behind polaroid card)
  // Source bounds: x=630, y=600, w=394, h=424
  // Destination: x=657, y=1040, w=423, h=450 (which matches 1490 bottom edge)
  ctx.drawImage(templateImg, 630, 600, 394, 424, 657, 1040, 423, 450);

  // 8. Draw circular postmark stamp programmatically for sharp vector fidelity
  ctx.save();
  ctx.translate(920, 160);
  ctx.rotate((-15 * Math.PI) / 180);
  ctx.strokeStyle = 'rgba(15, 90, 110, 0.35)'; // Teal postmark ink
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.stroke();
  
  // Stamp text
  ctx.fillStyle = 'rgba(15, 90, 110, 0.35)';
  ctx.font = 'bold 12px Courier New, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Curve text (approximated)
  ctx.fillText('GOA • INDIA', 0, -42);
  ctx.fillText('GOA • INDIA', 0, 42);
  ctx.font = 'bold 24px Courier New, monospace';
  ctx.fillText('🌴', 0, 0);
  ctx.restore();

  // 9. Draw code snippet on left side for developer flavor (within dark blue block)
  ctx.save();
  ctx.font = '14px JetBrains Mono, Courier New, monospace';
  ctx.textAlign = 'left';
  const codeSnippet = [
    '// life in goa',
    '// code all day',
    '// beach all night',
    '',
    'function build() {',
    '  solveProblems();',
    '  drinkChai();',
    '  shipFast();',
    '}',
    '',
    'while (alive) {',
    '  build();',
    '}'
  ];
  let codeY = 1130;
  for (const line of codeSnippet) {
    if (line.trim().startsWith('//')) {
      ctx.fillStyle = 'rgba(160, 210, 195, 0.6)'; // light green comments
    } else {
      ctx.fillStyle = 'rgba(244, 239, 235, 0.85)'; // light cream code
    }
    ctx.fillText(line, 45, codeY);
    codeY += 22;
  }
  ctx.restore();

  // 10. Draw > BUILD / CODE / SHIP / REPEAT labels
  ctx.save();
  ctx.font = 'bold 18px JetBrains Mono, Courier New, monospace';
  ctx.textAlign = 'left';
  const steps = [
    { text: 'BUILD', color: '#121212' },
    { text: 'CODE', color: '#121212' },
    { text: 'SHIP', color: '#121212' },
    { text: 'REPEAT', color: '#FF5A36' } // Orange highlight
  ];
  let stepY = 80;
  for (const step of steps) {
    ctx.fillStyle = step.color;
    ctx.fillText(`> ${step.text}`, 560, stepY);
    stepY += 24;
  }
  ctx.restore();

  // 11. Draw the user photo card (taped polaroid look)
  const pb = config.photoBox;
  const cardWidth = pb.width;
  const cardHeight = 760; // Shrunk height to be more compact and fit perfectly
  
  ctx.save();
  // Move coordinate system to the center of the rotated card
  ctx.translate(pb.x + cardWidth / 2, pb.y + cardHeight / 2);
  ctx.rotate((pb.rotation * Math.PI) / 180);

  // Draw Card Shadow
  ctx.shadowColor = 'rgba(30, 25, 20, 0.18)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 12;

  // Draw Card Base (Cream Polaroid Card background)
  ctx.fillStyle = '#FAF7F2';
  roundRect(ctx, -cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14);
  ctx.fill();

  // Clear card shadow for inner elements
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetY = 0;
  ctx.shadowOffsetX = 0;

  // Draw fine card border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 14);
  ctx.stroke();

  // Draw user photo area
  const photoMargin = 22;
  const photoW = cardWidth - photoMargin * 2;
  const photoH = 500; // Shrunk height of image region to avoid empty space below
  const photoX = -cardWidth / 2 + photoMargin;
  const photoY = -cardHeight / 2 + photoMargin;

  // Base placeholder drawing if photo doesn't exist
  ctx.fillStyle = '#EBE7DF';
  roundRect(ctx, photoX, photoY, photoW, photoH, 6);
  ctx.fill();

  if (options.photo) {
    try {
      const userImg = await loadImage(options.photo);
      
      // Calculate crop coordinates
      const crop = calculateCoverCrop(
        userImg.width,
        userImg.height,
        photoW,
        photoH,
        options.zoom,
        options.offsetX,
        options.offsetY
      );

      ctx.save();
      // Clip to photo box (with slightly rounded corners)
      roundRect(ctx, photoX, photoY, photoW, photoH, 6);
      ctx.clip();
      
      // Draw cropped image
      ctx.drawImage(
        userImg,
        crop.sx,
        crop.sy,
        crop.sWidth,
        crop.sHeight,
        photoX,
        photoY,
        photoW,
        photoH
      );
      ctx.restore();
    } catch (err) {
      console.error('Error rendering user image on canvas:', err);
      // Fallback text if image load fails
      ctx.fillStyle = '#9C9283';
      ctx.font = '24px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[ Photo Render Error ]', 0, -100);
    }
  } else {
    // Empty state camera graphic
    ctx.fillStyle = '#B4A998';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', 0, -100);
    
    ctx.font = '16px JetBrains Mono, monospace';
    ctx.fillStyle = '#7E7362';
    ctx.fillText('NO PHOTO SELECTED', 0, -30);
  }

  // Draw photo frame inner border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 2;
  roundRect(ctx, photoX, photoY, photoW, photoH, 6);
  ctx.stroke();

  // Draw user details (Name) on ripped paper tag
  const nameYRel = 205; // Center of the ripped name tag
  const paperW = 440;
  const paperH = 80;
  const paperX = -paperW / 2;
  const paperY = nameYRel - paperH / 2;
  
  drawRippedPaper(ctx, paperX, paperY, paperW, paperH);

  ctx.fillStyle = '#181816';
  ctx.font = `bold 56px Caveat, Permanent Marker, Brush Script MT, Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.name || 'Aryan Dev', 0, nameYRel);

  // Draw user details (Role Banner)
  const rp = config.rolePosition;
  const roleBoxX = rp.x - cardWidth / 2;
  const roleBoxY = 270; // Positioned compactly
  
  ctx.fillStyle = '#0F5A6E'; // Teal role banner background
  roundRect(ctx, roleBoxX, roleBoxY, rp.width, rp.height, 4);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${rp.fontSize}px JetBrains Mono, Courier New, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const roleText = `< ${options.role.toUpperCase() || 'FULL STACK DEVELOPER'} />`;
  ctx.fillText(roleText, 0, roleBoxY + rp.height / 2);

  ctx.restore(); // Restore card rotation context

  // 12. Vespa scooter has been moved to Step 7b in the background to prevent overlapping/cutting off card text

  // 13. Draw tapes on photo frame (back in global canvas coordinates)
  // Left tape (slightly rotated, overlapping top left of the photo frame card)
  drawTape(ctx, pb.x - 20, pb.y - 20, 110, 36, -35);
  // Right tape (slightly rotated, overlapping top right of the photo frame card)
  drawTape(ctx, pb.x + cardWidth - 90, pb.y - 20, 110, 36, 30);

  // 13a. Draw the "2026 - TROPICAL CODING RETREAT" tape from template in the foreground (overlaps the card)
  // Source bounds: x=150, y=338, w=370, h=82
  // Destination: x=187.5, y=395, w=389, h=86
  ctx.drawImage(templateImg, 150, 338, 370, 82, 187.5, 395, 389, 86);

  // 13. Draw the bottom black dashboard status bar
  const footerY = 1490;
  const footerH = 130;
  
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, footerY, config.width, footerH);

  // Draw bottom bar top border (distressed ripped paper effect approximation)
  ctx.strokeStyle = '#121212';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  let side = 1;
  for (let rx = 0; rx <= config.width; rx += 8) {
    ctx.lineTo(rx, footerY - (side * 2));
    side = -side;
  }
  ctx.stroke();

  // Left Section: GOOD CODE / GOOD PEOPLE / GOOD VIBES + Palm Icon
  ctx.save();
  ctx.fillStyle = '#FAF7F2';
  ctx.font = '14px JetBrains Mono, Courier New, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  ctx.font = '22px Arial';
  ctx.fillText('🌴', 45, footerY + footerH / 2);
  
  ctx.font = '13px JetBrains Mono, Courier New, monospace';
  ctx.fillStyle = 'rgba(250, 247, 242, 0.8)';
  ctx.fillText('GOOD CODE', 85, footerY + footerH / 2 - 20);
  ctx.fillText('GOOD PEOPLE', 85, footerY + footerH / 2);
  ctx.fillStyle = '#FF5A36'; // Orange accent
  ctx.fillText('GOOD VIBES', 85, footerY + footerH / 2 + 20);
  ctx.restore();

  // Middle Section: Flame Icon + HACKER MODE: [BUILDER TITLE]
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px JetBrains Mono, Courier New, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const midX = config.width / 2 - 80;
  // Orange flame icon
  ctx.font = '22px Arial';
  ctx.fillText('🔥', midX - 110, footerY + footerH / 2);
  
  ctx.font = '13px JetBrains Mono, Courier New, monospace';
  ctx.fillStyle = 'rgba(250, 247, 242, 0.6)';
  ctx.fillText('HACKATHON MODE', midX, footerY + footerH / 2 - 15);
  ctx.font = 'bold 14px JetBrains Mono, Courier New, monospace';
  ctx.fillStyle = '#FF5A36'; // Orange text
  ctx.fillText(`: ${options.builderTitle.toUpperCase() || 'NIGHT SHIFT BUILDER'}`, midX, footerY + footerH / 2 + 15);
  ctx.restore();

  // 14. Draw Taped ticket (BUILDER PASS) in bottom right corner dynamically
  ctx.save();
  // Center of the ticket
  const ticketX = 890;
  const ticketY = 1495;
  const ticketW = 210;
  const ticketH = 110;
  
  ctx.translate(ticketX + ticketW / 2, ticketY + ticketH / 2);
  ctx.rotate((5 * Math.PI) / 180); // Rotate by 5 degrees

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Background
  ctx.fillStyle = '#E5DFD3'; // warm beige ticket
  ctx.fillRect(-ticketW / 2, -ticketH / 2, ticketW, ticketH);

  // Clear shadow
  ctx.shadowColor = 'transparent';

  // Inner border
  ctx.strokeStyle = 'rgba(18, 18, 18, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-ticketW / 2 + 6, -ticketH / 2 + 6, ticketW - 12, ticketH - 12);

  // Ticket Text
  ctx.fillStyle = '#181816';
  ctx.font = 'bold 12px JetBrains Mono, Courier New, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BUILDER PASS', -ticketW / 2 + 15, -ticketH / 2 + 25);
  
  ctx.font = '11px JetBrains Mono, Courier New, monospace';
  ctx.fillText('HHG / 2026', -ticketW / 2 + 15, -ticketH / 2 + 45);

  // Draw Barcode lines programmatically!
  ctx.fillStyle = '#121212';
  const startBarcodeX = -ticketW / 2 + 15;
  const barcodeY = -ticketH / 2 + 60;
  const barcodeHeight = 35;
  
  // Preset widths to look like a real barcode
  const barWidths = [2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 1, 2];
  let currBarX = startBarcodeX;
  for (let i = 0; i < barWidths.length; i++) {
    const w = barWidths[i];
    if (i % 2 === 0) { // Alternating lines and gaps
      ctx.fillRect(currBarX, barcodeY, w, barcodeHeight);
    }
    currBarX += w + 1; // Width + gap
  }
  ctx.restore();

  // Draw tape on top of the ticket
  ctx.save();
  // Translate to the ticket tape position
  ctx.translate(ticketX + ticketW / 2 + 10, ticketY + 15);
  // Draw ticket tape
  drawTape(ctx, -40, -10, 80, 24, 8);
  ctx.restore();

  // 15. Paper grunge overlay disabled to prevent ghosting/overlapping text from the composite sheet
  // (Paper texture and noise are applied programmatically in step 16 below)

  // Apply overlay of noise for extra high-quality tactile feel
  ctx.save();
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 256;
  noiseCanvas.height = 256;
  const nCtx = noiseCanvas.getContext('2d');
  if (nCtx) {
    const nImgData = nCtx.createImageData(256, 256);
    const data = nImgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 20; // low opacity noise
    }
    nCtx.putImageData(nImgData, 0, 0);
    
    // Draw pattern
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(0, 0, config.width, config.height);
    }
  }
  ctx.restore();

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
