/**
 * Mapear productos.images (text[]) desde .jpg/.png hacia el *_full.webp más probable,
 * basándonos en las variantes que existan en Supabase Storage (misma carpeta).
 *
 * Motivación:
 * - En tu bucket existen *_full.webp y *_thumb.webp para muchas imágenes.
 * - Pero el nombre NO siempre coincide con una simple regla ".jpg -> _full.webp".
 *   Ejemplo: DEF_Ecorche.jpg puede corresponder a "DEF ecorche entero A001_full.webp".
 *
 * Uso:
 *   node app/scripts/map-products-images-to-webp.js --dry-run
 *   node app/scripts/map-products-images-to-webp.js
 *
 * Requiere:
 * - REACT_APP_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * IMPORTANTE:
 * - Este script NO borra imágenes. Solo actualiza referencias en la tabla `products`.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) throw new Error('Missing env: REACT_APP_SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY');

const BUCKET = 'product-images';
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = (() => {
  const idx = process.argv.indexOf('--limit');
  if (idx >= 0) {
    const v = parseInt(process.argv[idx + 1], 10);
    return Number.isFinite(v) ? v : null;
  }
  return null;
})();

function decodeMaybe(s) {
  if (typeof s !== 'string') return s;
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function isJpgOrPng(url) {
  return !!url && /\.(jpe?g|png)$/i.test(url);
}

function isWebp(url) {
  return !!url && /\.webp$/i.test(url);
}

function normalizeForTokens(name) {
  // Quita extensión y normaliza espacios/guiones/underscores.
  const n = (name || '')
    .toString()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!n) return [];

  return n
    .split(' ')
    .filter(Boolean)
    // Mantener tokens cortos solo si son muy informativos.
    .filter(t => t.length >= 3 || t === 'def');
}

function intersectionCount(aTokens, bTokens) {
  const b = new Set(bTokens);
  let count = 0;
  for (const t of aTokens) if (b.has(t)) count++;
  return count;
}

function extractStoragePath(publicUrl) {
  // Convierte URL pública -> path interno del storage (sin bucket).
  const marker = '/product-images/';
  const idx = publicUrl.indexOf(marker);
  if (idx < 0) return null;
  return decodeMaybe(publicUrl.slice(idx + marker.length));
}

function pickBestFullVariant({ originalNameTokens, candidatesFull, alreadyUsedFullNames }) {
  // candidatesFull: [{ name, tokens }]
  let best = null;
  for (const c of candidatesFull) {
    const overlap = intersectionCount(originalNameTokens, c.tokens);
    const isAlreadyUsed = alreadyUsedFullNames.has(c.name);

    // Score:
    // - Prioriza mayor overlap
    // - Penaliza candidatos ya usados (para evitar duplicar side/variant si existe otra opción)
    // - Si overlap es igual, usar "no usado" como tiebreak.
    const score = overlap * 10 + (isAlreadyUsed ? -1 : 1);

    if (!best || score > best.score) {
      best = { ...c, score, overlap, isAlreadyUsed };
    }
  }

  return best;
}

function buildPublicUrl({ supabaseUrl, bucket, filePath }) {
  // Supabase encodea, pero lo hacemos aquí para no depender de getPublicUrl repetidamente.
  // filePath puede tener espacios. Encodeamos cada segmento.
  const encoded = filePath
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encoded}`;
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let totalProducts = 0;
  let updatedProducts = 0;
  let replacedCount = 0;
  let keepCount = 0;
  let noCandidateCount = 0;
  const exampleChanges = [];

  const pageSize = 100;
  let offset = 0;

  // Cache: por carpeta => set de nombres existentes
  const folderNamesCache = new Map();

  while (true) {
    const rangeStart = offset;
    const rangeEnd = offset + pageSize - 1;
    if (LIMIT != null && rangeStart >= LIMIT) break;

    const takeEnd = LIMIT != null ? Math.min(rangeEnd, LIMIT - 1) : rangeEnd;

    const { data, error } = await supabase
      .from('products')
      .select('code,images')
      .order('code')
      .range(rangeStart, takeEnd);

    if (error) throw error;
    const rows = data || [];
    if (rows.length === 0) break;

    for (const row of rows) {
      totalProducts++;

      const images = row.images || [];
      if (!Array.isArray(images) || images.length === 0) continue;

      // Encuentra qué full webp ya están en el array para evitar duplicarlos.
      const usedFullNames = new Set(
        images
          .filter(u => typeof u === 'string' && isWebp(u) && /_full\.webp$/i.test(u))
          .map(u => extractStoragePath(u)?.split('/').pop())
          .filter(Boolean)
      );

      // Pre-cargar folder listing para todas las carpetas donde haya jpg/png en este producto.
      const foldersToList = new Set();
      for (const u of images) {
        if (!isJpgOrPng(u)) continue;
        const storagePath = extractStoragePath(u);
        if (!storagePath) continue;
        const folder = storagePath.split('/').slice(0, -1).join('/');
        foldersToList.add(folder);
      }

      for (const folder of foldersToList) {
        if (folderNamesCache.has(folder)) continue;
        const { data: listed, error: listError } = await supabase.storage
          .from(BUCKET)
          .list(folder, { limit: 500, sortBy: { column: 'name', order: 'asc' } });

        if (listError) {
          // Si falla el list, no rompe el proceso completo.
          folderNamesCache.set(folder, new Set());
        } else {
          folderNamesCache.set(folder, new Set((listed || []).map(x => x.name)));
        }
      }

      let changed = false;
      const newImages = [];

      for (const u of images) {
        if (!isJpgOrPng(u)) {
          newImages.push(u);
          continue;
        }

        const storagePath = extractStoragePath(u);
        if (!storagePath) {
          newImages.push(u);
          keepCount++;
          continue;
        }

        const decodedFolder = storagePath.split('/').slice(0, -1).join('/');
        const baseName = storagePath.split('/').pop().replace(/\.[a-z0-9]+$/i, '');
        const originalNameTokens = normalizeForTokens(baseName);

        const folderNames = folderNamesCache.get(decodedFolder) || new Set();
        const candidatesFull = Array.from(folderNames)
          .filter(n => /_full\.webp$/i.test(n))
          .map(n => ({
            name: n,
            tokens: normalizeForTokens(n),
          }));

        if (candidatesFull.length === 0) {
          newImages.push(u);
          keepCount++;
          noCandidateCount++;
          continue;
        }

        const best = pickBestFullVariant({
          originalNameTokens,
          candidatesFull,
          alreadyUsedFullNames: usedFullNames,
        });

        if (!best) {
          newImages.push(u);
          keepCount++;
          continue;
        }

        const fullFileName = best.name;
        const fullPath = `${decodedFolder}/${fullFileName}`;
        const fullUrl = buildPublicUrl({ supabaseUrl: SUPABASE_URL, bucket: BUCKET, filePath: fullPath });

        // Si el candidato existe (por definición, viene del folder listing), reemplazamos.
        newImages.push(fullUrl);
        replacedCount++;
        changed = true;

        usedFullNames.add(fullFileName);

        if (exampleChanges.length < 8) {
          exampleChanges.push({
            code: row.code,
            from: u,
            to: fullUrl,
            score: best.score,
          });
        }
      }

      if (!changed) continue;

      if (!DRY_RUN) {
        const { error: updError } = await supabase
          .from('products')
          .update({ images: newImages })
          .eq('code', row.code);

        if (updError) throw updError;
      }

      updatedProducts++;
      if (LIMIT != null && updatedProducts > 5000) break;
    }

    offset += pageSize;
    if (LIMIT != null && offset >= LIMIT) break;
  }

  console.log(JSON.stringify({
    dryRun: DRY_RUN,
    totalProductsScanned: totalProducts,
    updatedProducts,
    replacedCount,
    keepCount,
    noCandidateCount,
    exampleChanges,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

