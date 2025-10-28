const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');

async function generateFavicon() {
  console.log('🎨 Generating favicon from SVG...');

  // Read the SVG file
  const svgBuffer = fs.readFileSync('favicon.svg');

  // Generate PNG images at different sizes for the ICO file
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    console.log(`📐 Creating ${size}x${size} PNG...`);
    const buffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers.push(buffer);
  }

  // Create the ICO file from the PNG buffers
  console.log('🔧 Combining into favicon.ico...');
  const icoBuffer = await toIco(pngBuffers);

  // Write the ICO file
  fs.writeFileSync('favicon.ico', icoBuffer);

  // Also create a standard PNG favicon for modern browsers
  console.log('🖼️  Creating additional PNG versions...');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('favicon-192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('favicon-512.png');

  console.log('✅ Favicon generation complete!');
  console.log('   - favicon.ico (multi-resolution: 16, 32, 48, 64, 128, 256)');
  console.log('   - favicon-192.png (for modern browsers)');
  console.log('   - favicon-512.png (for modern browsers)');
  console.log('   - favicon.svg (original vector)');
}

generateFavicon().catch(err => {
  console.error('❌ Error generating favicon:', err);
  process.exit(1);
});
