/**
 * Genera los iconos PNG e ICO desde favicon.svg usando sharp.
 * Uso: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const svg = fs.readFileSync(svgPath);
const publicDir = path.join(__dirname, '../public');

const pngSizes = [
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

// Construye un fichero .ico embebiendo los PNGs (formato moderno compatible con todos los browsers)
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1=ICO
  header.writeUInt16LE(count, 4);

  let offset = 6 + 16 * count;
  const dirs = pngBuffers.map((buf) => {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const dir = Buffer.alloc(16);
    dir.writeUInt8(w >= 256 ? 0 : w, 0);
    dir.writeUInt8(h >= 256 ? 0 : h, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(buf.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += buf.length;
    return dir;
  });

  return Buffer.concat([header, ...dirs, ...pngBuffers]);
}

async function run() {
  // PNGs para manifest y apple-touch-icon
  for (const { name, size } of pngSizes) {
    const outPath = path.join(publicDir, name);
    await sharp(svg).resize(size, size).png().toFile(outPath);
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // favicon.ico con 16x16, 32x32 y 48x48
  const buffers = await Promise.all(
    [16, 32, 48].map((s) => sharp(svg).resize(s, s).png().toBuffer())
  );
  const ico = buildIco(buffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  console.log('✓ favicon.ico (16x16, 32x32, 48x48)');

  console.log('Iconos generados correctamente.');
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
