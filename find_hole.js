const fs = require('fs');
const { createCanvas, Image } = require('canvas');

async function findHole() {
  const img = new Image();
  img.src = fs.readFileSync('./public/templates/classic/template_v2.jpg');
  
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  
  console.log(`Image dimensions: ${img.width}x${img.height}`);
  
  // Sample a grid to find the checkerboard
  for (let y = 300; y < 800; y += 100) {
    for (let x = 100; x < 600; x += 100) {
      const i = (y * canvas.width + x) * 4;
      console.log(`[${x}, ${y}] rgb(${data[i]}, ${data[i+1]}, ${data[i+2]})`);
    }
  }
}
findHole().catch(console.error);
