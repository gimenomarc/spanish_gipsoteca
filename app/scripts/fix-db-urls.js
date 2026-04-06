/**
 * Fix Database Image URLs
 *
 * Handles two cases:
 *   1. Old JPG URLs → new _full.webp (same folder structure)
 *   2. URL-encoded WebP paths (DEF%20foo_full.webp) → decoded (DEF foo_full.webp)
 *
 * Usage:
 *   node scripts/fix-db-urls.js --dry-run    # Preview
 *   node scripts/fix-db-urls.js              # Execute
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images`;
const DRY_RUN = process.argv.includes('--dry-run');

async function listAllFiles(prefix = '') {
  const allFiles = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from('product-images')
      .list(prefix, { limit: 100, offset });
    if (error || !data || data.length === 0) break;
    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) {
        allFiles.push(fullPath);
      } else {
        allFiles.push(...await listAllFiles(fullPath));
      }
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return allFiles;
}

/**
 * Given a DB image URL, returns the correct new URL or null if no change needed.
 * remoteSet = Set of paths currently in Supabase Storage (decoded, with spaces)
 */
function resolveUrl(url, remoteSet) {
  if (!url || !url.includes(BASE_URL)) return null;

  const rawPath = url.replace(BASE_URL + '/', '');
  const decodedPath = decodeURIComponent(rawPath);

  // Case 1: Already correct (decoded path exists in storage)
  if (remoteSet.has(decodedPath)) {
    // If it was URL-encoded in DB, fix it
    if (rawPath !== decodedPath) {
      return `${BASE_URL}/${decodedPath}`;
    }
    return null; // No change needed
  }

  // Case 2: Old JPG → convert to _full.webp
  if (/\.(jpg|jpeg|JPG|png)$/.test(decodedPath)) {
    const webpPath = decodedPath.replace(/\.(jpg|jpeg|JPG|png)$/, '_full.webp');
    if (remoteSet.has(webpPath)) {
      return `${BASE_URL}/${webpPath}`;
    }
    // Not found in storage — truly missing
    return '__MISSING__';
  }

  // WebP that doesn't exist in storage
  return '__MISSING__';
}

async function main() {
  console.log('='.repeat(70));
  console.log('  FIX DATABASE IMAGE URLs');
  console.log('='.repeat(70));
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'}\n`);

  console.log('Loading Supabase Storage file list...');
  const remoteFiles = await listAllFiles();
  const remoteSet = new Set(remoteFiles);
  console.log(`  ${remoteFiles.length} files in storage\n`);

  const { data: products, error } = await supabase.from('products').select('code, images');
  if (error) { console.error('DB error:', error.message); return; }

  let toUpdate = 0;
  let alreadyOk = 0;
  let missing = 0;
  const missingList = [];

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    let changed = false;
    const newImages = product.images.map(url => {
      const resolved = resolveUrl(url, remoteSet);
      if (resolved === null) {
        alreadyOk++;
        return url;
      }
      if (resolved === '__MISSING__') {
        missing++;
        missingList.push({ code: product.code, url });
        return url; // Keep old URL, flag it
      }
      changed = true;
      return resolved;
    });

    if (!changed) continue;
    toUpdate++;

    if (DRY_RUN) {
      console.log(`  [${product.code}]`);
      product.images.forEach((url, i) => {
        const resolved = resolveUrl(url, remoteSet);
        if (resolved && resolved !== '__MISSING__') {
          console.log(`    ${url.split('/').pop()}`);
          console.log(`    → ${resolved.split('/').pop()}`);
        }
      });
      console.log('');
    } else {
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('code', product.code);

      if (updateError) {
        console.error(`  ERROR [${product.code}]: ${updateError.message}`);
      } else {
        process.stdout.write(`  Updated ${product.code}\n`);
      }
    }
  }

  console.log('='.repeat(70));
  console.log(`  Already correct:  ${alreadyOk}`);
  console.log(`  To update:        ${toUpdate}`);
  console.log(`  Truly missing:    ${missing}`);
  console.log('='.repeat(70));

  if (missing > 0) {
    console.log('\n  Products with missing images (no WebP found):');
    for (const m of missingList) {
      console.log(`    [${m.code}] ${m.url.split('/').pop()}`);
    }
  }

  if (DRY_RUN) {
    console.log('\n  Run without --dry-run to apply.');
  } else if (missing === 0) {
    console.log('\n  All URLs fixed successfully.');
  }
}

main().catch(console.error);
