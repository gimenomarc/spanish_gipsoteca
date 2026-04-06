/**
 * Fix SG Gallery image URLs in the database.
 *
 * - sg_gallery_photos.image_url: maps old JPG paths to new _full.webp in sg-gallery/photos/
 * - sg_gallery_collections.cover_image: sets cover to first available photo of that collection
 *
 * Usage:
 *   node scripts/fix-sg-gallery-urls.js --dry-run
 *   node scripts/fix-sg-gallery-urls.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images`;
const DRY_RUN = process.argv.includes('--dry-run');

async function listDir(prefix) {
  const files = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from('product-images')
      .list(prefix, { limit: 100, offset });
    if (error || !data || data.length === 0) break;
    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) files.push(fullPath);
      else files.push(...await listDir(fullPath));
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return files;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  FIX SG GALLERY IMAGE URLs');
  console.log('='.repeat(70));
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'}\n`);

  // List all sg-gallery/photos files
  const storageFiles = await listDir('sg-gallery/photos');
  console.log(`Found ${storageFiles.length} files in sg-gallery/photos/\n`);

  // Normalize a filename for fuzzy matching:
  // lowercase, spaces/underscores → hyphens, strip parentheses like (1) → 1
  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/\((\d+)\)/g, '$1')
      .replace(/-+/g, '-')
      .trim();
  }

  // Build lookup: normalized_basename → full_storage_path (only _full.webp)
  const lookup = {};
  for (const f of storageFiles) {
    if (!f.endsWith('_full.webp')) continue;
    const filename = f.split('/').pop();
    const raw = filename.replace('_full.webp', '');
    const key = normalize(raw);
    lookup[key] = f;
  }

  // ── FIX PHOTOS ──────────────────────────────────────────────────────────
  console.log('── sg_gallery_photos ──');
  const { data: photos, error: photosErr } = await supabase
    .from('sg_gallery_photos')
    .select('id, image_url, collection_id');

  if (photosErr) { console.error('Error:', photosErr.message); return; }

  let photosFixed = 0, photosMissing = 0;

  for (const photo of photos) {
    const url = photo.image_url;
    if (!url) continue;

    // Already a working webp — skip
    const decodedUrl = decodeURIComponent(url);
    if (decodedUrl.includes('sg-gallery/photos/') && decodedUrl.endsWith('_full.webp')) {
      const path = decodedUrl.replace(BASE_URL + '/', '');
      if (storageFiles.includes(path)) continue; // already correct
    }

    // Extract base filename, normalize for fuzzy match
    const filename = url.split('/').pop();
    const base = normalize(decodeURIComponent(filename).replace(/\.(jpg|jpeg|JPG|png|webp)$/, ''));

    const match = lookup[base];
    if (!match) {
      console.log(`  MISSING: ${filename} (no match in storage)`);
      photosMissing++;
      continue;
    }

    const newUrl = `${BASE_URL}/${match}`;
    console.log(`  ${filename} → ${match.split('/').pop()}`);

    if (!DRY_RUN) {
      const { error } = await supabase
        .from('sg_gallery_photos')
        .update({ image_url: newUrl })
        .eq('id', photo.id);
      if (error) console.error(`  ERROR: ${error.message}`);
    }
    photosFixed++;
  }

  console.log(`\n  Fixed: ${photosFixed}  Missing: ${photosMissing}\n`);

  // ── FIX COLLECTION COVERS ────────────────────────────────────────────────
  console.log('── sg_gallery_collections covers ──');
  const { data: collections, error: colsErr } = await supabase
    .from('sg_gallery_collections')
    .select('id, slug, cover_image');

  if (colsErr) { console.error('Error:', colsErr.message); return; }

  // After fixing photos, find first photo per collection to use as cover
  const { data: allPhotos } = await supabase
    .from('sg_gallery_photos')
    .select('id, image_url, collection_id')
    .order('display_order', { ascending: true });

  let coversFixed = 0, coversMissing = 0;

  for (const col of collections) {
    const currentUrl = col.cover_image || '';
    const isValid = currentUrl.includes('_full.webp');

    if (isValid) {
      console.log(`  [${col.slug}] cover already OK`);
      continue;
    }

    // Find first photo of this collection (preferring DEF images)
    const colPhotos = (allPhotos || []).filter(p => p.collection_id === col.id && p.image_url);

    if (colPhotos.length === 0) {
      console.log(`  [${col.slug}] NO PHOTOS — cannot set cover`);
      coversMissing++;
      continue;
    }

    // Try to find the best photo from storage for this collection
    // Resolve the first photo's URL to its new webp path
    let coverUrl = null;
    for (const p of colPhotos) {
      const filename = p.image_url.split('/').pop();
      const base = normalize(decodeURIComponent(filename).replace(/\.(jpg|jpeg|JPG|png|webp)$/, '').replace('_full', ''));
      const match = lookup[base];
      if (match) {
        coverUrl = `${BASE_URL}/${match}`;
        break;
      }
    }

    if (!coverUrl) {
      // Fallback: use first file in storage for this collection
      const firstFile = storageFiles.find(f => f.endsWith('_full.webp'));
      if (firstFile) coverUrl = `${BASE_URL}/${firstFile}`;
    }

    if (!coverUrl) {
      console.log(`  [${col.slug}] cannot resolve cover`);
      coversMissing++;
      continue;
    }

    console.log(`  [${col.slug}] → ${coverUrl.split('/').pop()}`);

    if (!DRY_RUN) {
      const { error } = await supabase
        .from('sg_gallery_collections')
        .update({ cover_image: coverUrl })
        .eq('id', col.id);
      if (error) console.error(`  ERROR: ${error.message}`);
    }
    coversFixed++;
  }

  console.log(`\n  Fixed: ${coversFixed}  Missing: ${coversMissing}`);
  console.log('\n' + '='.repeat(70));

  if (DRY_RUN) console.log('  Run without --dry-run to apply.');
  else console.log('  Done!');
}

main().catch(console.error);
