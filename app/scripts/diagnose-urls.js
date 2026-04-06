/**
 * Diagnose: cross-reference DB image URLs with actual Supabase Storage files.
 * Shows which DB URLs are broken (file deleted) and which are fine.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images`;

async function listAllFiles(prefix = '') {
  const allFiles = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from('product-images')
      .list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error || !data || data.length === 0) break;
    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) {
        allFiles.push(fullPath);
      } else {
        const sub = await listAllFiles(fullPath);
        allFiles.push(...sub);
      }
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return allFiles;
}

async function main() {
  console.log('Listing Supabase Storage files...');
  const remoteFiles = await listAllFiles();
  const remoteSet = new Set(remoteFiles);

  // Show folder breakdown
  const folderCounts = {};
  for (const f of remoteFiles) {
    const folder = f.split('/')[0];
    folderCounts[folder] = (folderCounts[folder] || 0) + 1;
  }
  console.log(`\nStorage folders (${remoteFiles.length} total files):`);
  for (const [folder, count] of Object.entries(folderCounts)) {
    console.log(`  ${folder}/  →  ${count} files`);
  }

  // Fetch DB products
  const { data: products, error } = await supabase.from('products').select('code, images');
  if (error) { console.error('DB error:', error.message); return; }

  const broken = [];
  const ok = [];
  const dbFolders = {};

  for (const product of products) {
    if (!product.images) continue;
    for (const url of product.images) {
      if (!url.includes(BASE_URL)) continue;
      const storagePath = url.replace(BASE_URL + '/', '');
      const folder = storagePath.split('/')[0];
      dbFolders[folder] = (dbFolders[folder] || 0) + 1;

      if (remoteSet.has(storagePath)) {
        ok.push({ code: product.code, url, storagePath });
      } else {
        broken.push({ code: product.code, url, storagePath });
      }
    }
  }

  console.log(`\nDB image URL folders:`);
  for (const [folder, count] of Object.entries(dbFolders)) {
    console.log(`  ${folder}/  →  ${count} URLs`);
  }

  console.log(`\nResults:`);
  console.log(`  OK (file exists):     ${ok.length}`);
  console.log(`  BROKEN (file gone):   ${broken.length}`);

  if (broken.length > 0) {
    console.log(`\nFirst 20 broken URLs:`);
    for (const b of broken.slice(0, 20)) {
      console.log(`  [${b.code}] ${b.storagePath}`);
    }
    if (broken.length > 20) console.log(`  ... and ${broken.length - 20} more`);
  }
}

main().catch(console.error);
