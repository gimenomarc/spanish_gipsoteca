/**
 * Fix Accented Uploads
 *
 * Uploads the WebP files that failed due to accented characters in paths,
 * then updates the database URLs to point to the new sanitized paths.
 *
 * Usage:
 *   node scripts/fix-accented-uploads.js --dry-run    # Preview
 *   node scripts/fix-accented-uploads.js              # Execute
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = 'product-images';
const OPTIMIZED_DIR = path.join(__dirname, '..', 'public', 'images-optimized');
const BASE_URL = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Removes accented characters and replaces with ASCII equivalents.
 * Only sanitizes individual path segments, preserving slashes.
 */
function sanitizePath(p) {
  return p
    .split('/')
    .map(segment =>
      segment
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    )
    .join('/');
}

function getOptimizedFiles(dir, prefix = '') {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.isDirectory()) {
      results.push(...getOptimizedFiles(fullPath, relativePath));
    } else if (item.name.endsWith('.webp')) {
      results.push({ localPath: fullPath, relativePath });
    }
  }
  return results;
}

function mapToSupabasePath(relativePath) {
  let p = relativePath.replace(/\\/g, '/');

  if (p.startsWith('THE SG GALLERY/')) {
    return `sg-gallery/photos/${p.split('/').pop()}`;
  }

  // For all other paths (categorias, hero, about, contacto, faqs) keep as-is
  return p;
}

function hasAccent(str) {
  return /[^\u0000-\u007F]/.test(str);
}

async function listRemoteFiles(prefix = '') {
  const allFiles = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error || !data || data.length === 0) break;

    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) {
        allFiles.push(fullPath);
      } else {
        const sub = await listRemoteFiles(fullPath);
        allFiles.push(...sub);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  FIX ACCENTED UPLOADS');
  console.log('='.repeat(70));
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'}`);
  console.log('');

  // Find all local WebP files whose mapped path has accented characters
  const allFiles = getOptimizedFiles(OPTIMIZED_DIR);
  const problematic = allFiles.filter(f => {
    const remotePath = mapToSupabasePath(f.relativePath.replace(/\\/g, '/'));
    return hasAccent(remotePath);
  });

  console.log(`Found ${problematic.length} files with accented paths to fix:\n`);

  // Also get current remote files to detect already-uploaded ones
  console.log('Checking existing remote files...');
  const remoteFiles = await listRemoteFiles();
  const remoteSet = new Set(remoteFiles);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;
  const urlMappings = []; // { oldUrl, newUrl }

  for (const f of problematic) {
    const originalPath = mapToSupabasePath(f.relativePath.replace(/\\/g, '/'));
    const sanitizedPath = sanitizePath(originalPath);

    const oldUrl = `${BASE_URL}/${originalPath}`;
    const newUrl = `${BASE_URL}/${sanitizedPath}`;

    console.log(`  ${originalPath}`);
    console.log(`  → ${sanitizedPath}`);

    urlMappings.push({ oldUrl, newUrl });

    if (remoteSet.has(sanitizedPath)) {
      console.log('    [SKIP] Already uploaded\n');
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log('    [DRY RUN] Would upload\n');
      uploaded++;
      continue;
    }

    const fileBuffer = fs.readFileSync(f.localPath);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(sanitizedPath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (error) {
      console.error(`    [ERROR] ${error.message}\n`);
      errors++;
    } else {
      console.log('    [OK] Uploaded\n');
      uploaded++;
    }
  }

  console.log('='.repeat(70));
  console.log(`  Uploaded: ${uploaded}  Skipped: ${skipped}  Errors: ${errors}`);
  console.log('='.repeat(70));

  if (DRY_RUN) {
    console.log('\n  DRY RUN complete. Run without --dry-run to execute.');
    console.log('\n  URL mappings that will be applied to database:');
    for (const m of urlMappings.slice(0, 5)) {
      console.log(`    ${m.oldUrl.split('/').pop()}`);
      console.log(`    → ${m.newUrl.split('/').pop()}`);
    }
    if (urlMappings.length > 5) console.log(`    ... and ${urlMappings.length - 5} more`);
    return;
  }

  if (errors > 0) {
    console.log('\n  There were upload errors. Fix them before updating the database.');
    return;
  }

  // Update database: products.images array
  console.log('\nUpdating database URLs...');

  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('code, images');

  if (fetchError) {
    console.error('  ERROR fetching products:', fetchError.message);
    return;
  }

  let dbUpdated = 0;
  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    let changed = false;
    const newImages = product.images.map(url => {
      for (const { oldUrl, newUrl } of urlMappings) {
        if (url === oldUrl) {
          changed = true;
          return newUrl;
        }
      }
      return url;
    });

    if (changed) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('code', product.code);

      if (updateError) {
        console.error(`  ERROR updating product ${product.code}: ${updateError.message}`);
      } else {
        console.log(`  Updated product ${product.code}`);
        dbUpdated++;
      }
    }
  }

  console.log(`\n  Database: ${dbUpdated} products updated`);
  console.log('\n  Done! All accented paths fixed.');
}

main().catch(console.error);
