/**
 * Genera y sube a Supabase los _thumb.webp que faltan.
 *
 * Funciona así:
 *  1. Obtiene todos los productos y fotos de SG Gallery de Supabase
 *  2. Para cada imagen _full.webp, comprueba si existe la versión _thumb.webp
 *  3. Si no existe: descarga el _full, genera el _thumb con sharp, sube a Supabase
 *
 * Uso: node scripts/generate-missing-thumbs.js
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const https = require('https');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = 'product-images';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Configuración de thumb igual que el script principal
const THUMB_CONFIG = {
  product: { width: 400, height: 533, quality: 78 },
  gallery: { width: 600, height: null, quality: 75 },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function thumbExists(storagePath) {
  const thumbPath = storagePath.replace('_full.webp', '_thumb.webp');
  const { data } = await supabase.storage.from(BUCKET).list(
    path.dirname(thumbPath),
    { search: path.basename(thumbPath) }
  );
  return Array.isArray(data) && data.length > 0;
}

function extractStoragePath(fullUrl) {
  // https://xxx.supabase.co/storage/v1/object/public/product-images/PATH
  const marker = `/public/${BUCKET}/`;
  const idx = fullUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(fullUrl.slice(idx + marker.length));
}

async function generateAndUpload(imageUrl, type) {
  const storagePath = extractStoragePath(imageUrl);
  if (!storagePath) {
    console.log(`  ⚠ No se pudo extraer el path de: ${imageUrl}`);
    return false;
  }
  if (!storagePath.includes('_full.webp')) {
    return false; // No aplica
  }

  const thumbPath = storagePath.replace('_full.webp', '_thumb.webp');
  const cfg = THUMB_CONFIG[type] || THUMB_CONFIG.product;

  // Descargar el _full
  let originalBuffer;
  try {
    originalBuffer = await fetchBuffer(imageUrl.replace(/ /g, '%20'));
  } catch (err) {
    console.log(`  ✗ Error descargando: ${err.message}`);
    return false;
  }

  // Generar el thumb con sharp
  let thumbBuffer;
  try {
    let pipeline = sharp(originalBuffer);
    if (cfg.width && cfg.height) {
      pipeline = pipeline.resize(cfg.width, cfg.height, {
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: true,
      });
    } else if (cfg.width) {
      pipeline = pipeline.resize(cfg.width, null, { withoutEnlargement: true });
    }
    thumbBuffer = await pipeline.webp({ quality: cfg.quality, effort: 6 }).toBuffer();
  } catch (err) {
    console.log(`  ✗ Error generando thumb: ${err.message}`);
    return false;
  }

  // Subir a Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(thumbPath, thumbBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    console.log(`  ✗ Error subiendo: ${error.message}`);
    return false;
  }

  const kb = (thumbBuffer.length / 1024).toFixed(0);
  console.log(`  ✓ ${path.basename(thumbPath)} (${kb} KB)`);
  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(65));
  console.log('  GENERATE MISSING THUMBS → Supabase Storage');
  console.log('='.repeat(65));

  let processed = 0;
  let uploaded = 0;
  let skipped = 0;

  // 1. Productos
  console.log('\n[ Productos ]\n');
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('name, code, images')
    .not('images', 'is', null);

  if (pErr) {
    console.error('Error al obtener productos:', pErr.message);
    process.exit(1);
  }

  for (const product of products) {
    if (!Array.isArray(product.images)) continue;

    for (const imageUrl of product.images) {
      if (!imageUrl.includes('_full.webp')) continue;

      processed++;
      const storagePath = extractStoragePath(imageUrl);
      if (!storagePath) continue;

      const thumbPath = storagePath.replace('_full.webp', '_thumb.webp');

      // Comprobar si ya existe
      const { data: existing } = await supabase.storage.from(BUCKET).list(
        path.dirname(thumbPath),
        { search: path.basename(thumbPath) }
      );

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      console.log(`[${product.code}] ${product.name}`);
      console.log(`  → ${path.basename(imageUrl)}`);
      const ok = await generateAndUpload(imageUrl, 'product');
      if (ok) uploaded++;
    }
  }

  // 2. SG Gallery Photos
  console.log('\n[ SG Gallery Photos ]\n');
  const { data: photos, error: gErr } = await supabase
    .from('sg_gallery_photos')
    .select('id, image_url');

  if (gErr) {
    console.warn('No se pudo acceder a sg_gallery_photos:', gErr.message);
  } else {
    for (const photo of (photos || [])) {
      const fullUrl = photo.image_url; // La columna image_url ya contiene _full.webp
      if (!fullUrl || !fullUrl.includes('_full.webp')) continue;

      processed++;
      const storagePath = extractStoragePath(fullUrl);
      if (!storagePath) continue;

      const thumbPath = storagePath.replace('_full.webp', '_thumb.webp');
      const { data: existing } = await supabase.storage.from(BUCKET).list(
        path.dirname(thumbPath),
        { search: path.basename(thumbPath) }
      );

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      console.log(`[gallery] ${path.basename(fullUrl)}`);
      const ok = await generateAndUpload(fullUrl, 'gallery');
      if (ok) uploaded++;
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log(`  Revisadas: ${processed} imágenes`);
  console.log(`  Ya tenían thumb: ${skipped}`);
  console.log(`  Generadas y subidas: ${uploaded}`);
  console.log('='.repeat(65));
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
