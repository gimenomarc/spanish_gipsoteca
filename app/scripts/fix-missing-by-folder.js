/**
 * Fix missing images by folder-based matching.
 *
 * For each broken DB image URL, looks in the same Storage folder
 * for _full.webp files and maps them as replacements.
 *
 * Usage:
 *   node scripts/fix-missing-by-folder.js --dry-run
 *   node scripts/fix-missing-by-folder.js
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
      if (item.id) allFiles.push(fullPath);
      else allFiles.push(...await listAllFiles(fullPath));
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return allFiles;
}

function isBroken(url, remoteSet) {
  if (!url || !url.includes(BASE_URL)) return false;
  const rawPath = url.replace(BASE_URL + '/', '');
  const decodedPath = decodeURIComponent(rawPath);
  return !remoteSet.has(decodedPath);
}

function getFolder(url) {
  const rawPath = url.replace(BASE_URL + '/', '');
  const decodedPath = decodeURIComponent(rawPath);
  const parts = decodedPath.split('/');
  return parts.slice(0, -1).join('/'); // everything except filename
}

async function main() {
  console.log('='.repeat(70));
  console.log('  FIX MISSING IMAGES — FOLDER MATCHING');
  console.log('='.repeat(70));
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'}\n`);

  console.log('Loading Storage files...');
  const remoteFiles = await listAllFiles();
  const remoteSet = new Set(remoteFiles);

  // Build folder → [_full.webp files] index
  const folderToFulls = {};
  for (const f of remoteFiles) {
    if (!f.endsWith('_full.webp')) continue;
    const parts = f.split('/');
    const folder = parts.slice(0, -1).join('/');
    if (!folderToFulls[folder]) folderToFulls[folder] = [];
    folderToFulls[folder].push(f);
  }

  const { data: products, error } = await supabase.from('products').select('code, images');
  if (error) { console.error('DB error:', error.message); return; }

  let totalFixed = 0;
  let totalStillMissing = 0;
  let totalUpdated = 0;

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    // Find which images are broken
    const brokenIndexes = product.images
      .map((url, i) => ({ url, i }))
      .filter(({ url }) => isBroken(url, remoteSet));

    if (brokenIndexes.length === 0) continue;

    // Group broken images by folder
    const folderGroups = {};
    for (const { url, i } of brokenIndexes) {
      const folder = getFolder(url);
      if (!folderGroups[folder]) folderGroups[folder] = [];
      folderGroups[folder].push({ url, i });
    }

    // For each folder, get available _full.webp files
    let changed = false;
    const newImages = [...product.images];

    for (const [folder, brokenItems] of Object.entries(folderGroups)) {
      const available = folderToFulls[folder] || [];

      if (available.length === 0) {
        console.log(`  [${product.code}] NO WEBP IN FOLDER: ${folder}`);
        for (const { url } of brokenItems) {
          console.log(`    missing: ${url.split('/').pop()}`);
          totalStillMissing++;
        }
        continue;
      }

      // Sort available WebPs (DEF first, then by name)
      available.sort((a, b) => {
        const aName = a.split('/').pop().toLowerCase();
        const bName = b.split('/').pop().toLowerCase();
        const aDef = aName.includes('def') ? 0 : 1;
        const bDef = bName.includes('def') ? 0 : 1;
        return aDef - bDef || aName.localeCompare(bName);
      });

      if (DRY_RUN) {
        console.log(`  [${product.code}] folder: ${folder}`);
        console.log(`    broken (${brokenItems.length}): ${brokenItems.map(b => b.url.split('/').pop()).join(', ')}`);
        console.log(`    available webp (${available.length}): ${available.map(f => f.split('/').pop()).join(', ')}`);
      }

      // Replace broken URLs with available WebPs (1-to-1 if counts match, else use first)
      for (let k = 0; k < brokenItems.length; k++) {
        const { i } = brokenItems[k];
        const replacement = available[k] || available[0];
        newImages[i] = `${BASE_URL}/${replacement}`;
        changed = true;
        totalFixed++;
      }
    }

    if (!changed) continue;

    if (!DRY_RUN) {
      // Deduplicate images
      const deduped = [...new Set(newImages)];
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: deduped })
        .eq('code', product.code);

      if (updateError) {
        console.error(`  ERROR [${product.code}]: ${updateError.message}`);
      } else {
        console.log(`  Updated ${product.code}`);
        totalUpdated++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`  Images fixed:         ${totalFixed}`);
  console.log(`  Still missing:        ${totalStillMissing}`);
  if (!DRY_RUN) console.log(`  Products updated:     ${totalUpdated}`);
  console.log('='.repeat(70));

  if (DRY_RUN) console.log('\n  Run without --dry-run to apply.');
}

main().catch(console.error);
