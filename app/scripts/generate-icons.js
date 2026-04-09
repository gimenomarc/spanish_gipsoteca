/**
 * Genera los iconos PNG desde favicon.svg usando sharp.
 * Uso: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const svg = fs.readFileSync(svgPath);

const sizes = [
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function run() {
  for (const { name, size } of sizes) {
    const outPath = path.join(__dirname, '../public', name);
    await sharp(svg).resize(size, size).png().toFile(outPath);
    console.log(`✓ ${name} (${size}x${size})`);
  }
  console.log('Iconos generados correctamente.');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
