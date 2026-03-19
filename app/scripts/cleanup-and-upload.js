/**
 * Supabase Storage Cleanup & Upload Script
 *
 * Deletes heavy original images from Supabase Storage and uploads
 * optimized WebP versions from public/images-optimized/.
 *
 * RUN THIS on March 8, 2026 when Supabase egress resets!
 *
 * Usage:
 *   node scripts/cleanup-and-upload.js --dry-run    # Preview (no changes)
 *   node scripts/cleanup-and-upload.js              # Execute cleanup + upload
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
const DRY_RUN = process.argv.includes('--dry-run');

let deletedCount = 0;
let deletedSizeMB = 0;
let uploadedCount = 0;
let uploadedSizeMB = 0;
let errorCount = 0;

async function listAllFiles(prefix = '') {
  const allFiles = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error(`  Error listing ${prefix}:`, error.message);
      break;
    }

    if (!data || data.length === 0) break;

    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id) {
        allFiles.push({
          path: fullPath,
          size: item.metadata?.size || 0,
          mimetype: item.metadata?.mimetype || '',
        });
      } else {
        const subFiles = await listAllFiles(fullPath);
        allFiles.push(...subFiles);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function deleteFile(filePath) {
  if (DRY_RUN) return true;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath]);

  if (error) {
    console.error(`  ERROR deleting ${filePath}: ${error.message}`);
    errorCount++;
    return false;
  }
  return true;
}

async function uploadFile(localPath, remotePath) {
  if (DRY_RUN) return true;

  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(remotePath, fileBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    console.error(`  ERROR uploading ${remotePath}: ${error.message}`);
    errorCount++;
    return false;
  }
  return true;
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
      const stats = fs.statSync(fullPath);
      results.push({
        localPath: fullPath,
        relativePath,
        size: stats.size,
      });
    }
  }
  return results;
}

function mapToSupabasePath(relativePath) {
  let p = relativePath.replace(/\\/g, '/');

  if (p.startsWith('categorias/')) {
    const parts = p.split('/');
    const filename = parts[parts.length - 1];
    const categoryFolder = parts[1];
    const productFolder = parts.length > 3 ? parts[2] : '';

    return productFolder
      ? `${parts.slice(0, 3).join('/')}/${filename}`
      : `${parts.slice(0, 2).join('/')}/${filename}`;
  }

  if (p.startsWith('THE SG GALLERY/')) {
    return `sg-gallery/photos/${p.split('/').pop()}`;
  }

  if (p.startsWith('hero/')) return p;
  if (p.startsWith('about/')) return p;
  if (p.startsWith('contacto/')) return p;
  if (p.startsWith('faqs/')) return p;

  return p;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  SUPABASE STORAGE CLEANUP & UPLOAD');
  console.log('='.repeat(70));
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'EXECUTE'}`);
  console.log(`  Bucket: ${BUCKET}`);
  console.log('='.repeat(70));
  console.log('');

  // Step 1: List all files currently in Supabase
  console.log('Step 1: Listing files in Supabase Storage...');
  const remoteFiles = await listAllFiles();
  const totalRemoteSizeMB = remoteFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
  console.log(`  Found ${remoteFiles.length} files (${totalRemoteSizeMB.toFixed(1)} MB)\n`);

  // Step 2: Identify heavy files to delete (originals > 500KB that aren't _thumb.webp or _full.webp)
  console.log('Step 2: Identifying heavy files to delete...');
  const heavyFiles = remoteFiles.filter(f => {
    const isHeavy = f.size > 500 * 1024; // > 500 KB
    const isOriginalJPG = f.path.endsWith('.jpg') || f.path.endsWith('.jpeg') || f.path.endsWith('.png') || f.path.endsWith('.JPG');
    return isHeavy && isOriginalJPG;
  });

  console.log(`  Found ${heavyFiles.length} heavy original files to delete:\n`);
  for (const f of heavyFiles.slice(0, 20)) {
    const sizeMB = (f.size / 1024 / 1024).toFixed(2);
    console.log(`    DELETE: ${f.path} (${sizeMB} MB)`);
  }
  if (heavyFiles.length > 20) {
    console.log(`    ... and ${heavyFiles.length - 20} more`);
  }

  const heavyTotalMB = heavyFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
  console.log(`\n  Total to delete: ${heavyTotalMB.toFixed(1)} MB\n`);

  // Step 3: Delete heavy files
  if (heavyFiles.length > 0) {
    console.log('Step 3: Deleting heavy original files...');
    for (const f of heavyFiles) {
      const success = await deleteFile(f.path);
      if (success) {
        deletedCount++;
        deletedSizeMB += f.size / 1024 / 1024;
        if (!DRY_RUN) {
          process.stdout.write(`\r  Deleted ${deletedCount}/${heavyFiles.length}...`);
        }
      }
    }
    console.log(`\n  Deleted ${deletedCount} files (${deletedSizeMB.toFixed(1)} MB freed)\n`);
  }

  // Step 4: Upload optimized images
  console.log('Step 4: Preparing optimized images for upload...');
  const optimizedFiles = getOptimizedFiles(OPTIMIZED_DIR);
  console.log(`  Found ${optimizedFiles.length} optimized WebP files\n`);

  if (optimizedFiles.length > 0) {
    console.log('Step 5: Uploading optimized images...');
    for (const f of optimizedFiles) {
      const remotePath = mapToSupabasePath(f.relativePath);
      const sizeMB = (f.size / 1024 / 1024).toFixed(2);

      if (DRY_RUN) {
        console.log(`    UPLOAD: ${f.relativePath} → ${remotePath} (${sizeMB} MB)`);
      }

      const success = await uploadFile(f.localPath, remotePath);
      if (success) {
        uploadedCount++;
        uploadedSizeMB += f.size / 1024 / 1024;
        if (!DRY_RUN) {
          process.stdout.write(`\r  Uploaded ${uploadedCount}/${optimizedFiles.length}...`);
        }
      }
    }
    console.log('');
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY');
  console.log('='.repeat(70));
  console.log(`  Files deleted:    ${deletedCount} (${deletedSizeMB.toFixed(1)} MB freed)`);
  console.log(`  Files uploaded:   ${uploadedCount} (${uploadedSizeMB.toFixed(1)} MB added)`);
  console.log(`  Net savings:      ${(deletedSizeMB - uploadedSizeMB).toFixed(1)} MB`);
  console.log(`  Errors:           ${errorCount}`);

  if (DRY_RUN) {
    console.log('\n  This was a DRY RUN. Run without --dry-run to execute.');
  } else {
    const newEstimate = totalRemoteSizeMB - deletedSizeMB + uploadedSizeMB;
    console.log(`\n  Estimated new storage: ${newEstimate.toFixed(0)} MB (was ${totalRemoteSizeMB.toFixed(0)} MB)`);
  }
  console.log('='.repeat(70));
}

main().catch(console.error);
