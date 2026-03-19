/**
 * Batch Image Optimizer for Supabase Storage
 *
 * Converts all JPG/PNG images to optimized WebP, dramatically reducing file sizes.
 * Expected savings: ~85-95% (e.g., 7MB JPG → 200-400KB WebP)
 *
 * Usage:
 *   node scripts/optimize-images.js              # Optimize all images
 *   node scripts/optimize-images.js --dry-run    # Preview without writing
 *   node scripts/optimize-images.js --upload     # Optimize + upload to Supabase
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'public', 'images');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images-optimized');

const CONFIGS = {
  // Product images (categorias/) → _full.webp and _thumb.webp
  product: {
    full: { width: 1200, height: 1600, quality: 82 },
    thumb: { width: 400, height: 533, quality: 78 },
  },
  // SG Gallery photos → single optimized version
  gallery: {
    full: { width: 1920, height: null, quality: 80 },
    thumb: { width: 600, height: null, quality: 75 },
  },
  // Static backgrounds (hero, about, contacto, faqs)
  background: {
    full: { width: 1920, height: null, quality: 75 },
  },
  // Portrait/about images
  portrait: {
    full: { width: 1000, height: null, quality: 80 },
  },
};

const DRY_RUN = process.argv.includes('--dry-run');
const UPLOAD = process.argv.includes('--upload');

let totalOriginalSize = 0;
let totalOptimizedSize = 0;
let fileCount = 0;

function getImageType(filePath) {
  const rel = path.relative(SOURCE_DIR, filePath).toLowerCase();
  if (rel.startsWith('the sg gallery')) return 'gallery';
  if (rel.startsWith('hero') || rel.startsWith('contacto') || rel.startsWith('faqs')) return 'background';
  if (rel.startsWith('about')) return 'portrait';
  if (rel.startsWith('categorias')) return 'product';
  return 'gallery';
}

function getAllImages(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllImages(fullPath));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimizeImage(inputPath) {
  const imageType = getImageType(inputPath);
  const config = CONFIGS[imageType];
  const stats = fs.statSync(inputPath);
  const originalSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  const relPath = path.relative(SOURCE_DIR, inputPath);
  const baseName = path.parse(inputPath).name;
  const relDir = path.dirname(relPath);
  const outputSubDir = path.join(OUTPUT_DIR, relDir);

  if (!DRY_RUN && !fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }

  const results = [];

  for (const [variant, opts] of Object.entries(config)) {
    const suffix = variant === 'full' ? '_full' : '_thumb';
    const outputName = Object.keys(config).length > 1
      ? `${baseName}${suffix}.webp`
      : `${baseName}.webp`;
    const outputPath = path.join(outputSubDir, outputName);

    if (DRY_RUN) {
      results.push({ variant, outputPath, estimatedSaving: '~90%' });
      continue;
    }

    try {
      let pipeline = sharp(inputPath);

      if (opts.width && opts.height) {
        pipeline = pipeline.resize(opts.width, opts.height, {
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: true,
        });
      } else if (opts.width) {
        pipeline = pipeline.resize(opts.width, null, {
          withoutEnlargement: true,
        });
      }

      await pipeline
        .webp({ quality: opts.quality, effort: 6 })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(0);

      totalOptimizedSize += newStats.size;
      results.push({ variant, outputPath, newSizeMB, savings: `${savings}%` });
    } catch (err) {
      console.error(`  ERROR processing ${variant}: ${err.message}`);
    }
  }

  totalOriginalSize += stats.size;
  fileCount++;

  return { relPath, originalSizeMB, imageType, results };
}

async function main() {
  console.log('='.repeat(70));
  console.log('  IMAGE OPTIMIZER - JPG/PNG → WebP');
  console.log('='.repeat(70));
  console.log(`  Source:  ${SOURCE_DIR}`);
  console.log(`  Output:  ${OUTPUT_DIR}`);
  console.log(`  Mode:    ${DRY_RUN ? 'DRY RUN (preview only)' : UPLOAD ? 'OPTIMIZE + UPLOAD' : 'OPTIMIZE'}`);
  console.log('='.repeat(70));
  console.log('');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const images = getAllImages(SOURCE_DIR);
  console.log(`Found ${images.length} images to optimize.\n`);

  if (!DRY_RUN && !fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const imagePath of images) {
    const result = await optimizeImage(imagePath);
    const icon = result.imageType === 'product' ? 'P' :
                 result.imageType === 'gallery' ? 'G' :
                 result.imageType === 'background' ? 'B' : 'R';

    console.log(`[${icon}] ${result.relPath} (${result.originalSizeMB} MB)`);
    for (const r of result.results) {
      if (DRY_RUN) {
        console.log(`    → ${r.variant}: ${r.estimatedSaving} savings (dry run)`);
      } else {
        console.log(`    → ${r.variant}: ${r.newSizeMB} MB (${r.savings} smaller)`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY');
  console.log('='.repeat(70));
  console.log(`  Files processed:  ${fileCount}`);
  console.log(`  Original total:   ${(totalOriginalSize / 1024 / 1024).toFixed(1)} MB`);

  if (!DRY_RUN) {
    console.log(`  Optimized total:  ${(totalOptimizedSize / 1024 / 1024).toFixed(1)} MB`);
    console.log(`  Total savings:    ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(0)}%`);
    console.log(`\n  Output directory:  ${OUTPUT_DIR}`);
  }

  console.log('='.repeat(70));

  if (UPLOAD) {
    console.log('\n  Upload to Supabase: Not yet implemented.');
    console.log('  For now, upload manually via Supabase Dashboard or use the admin panel.');
  }

  if (DRY_RUN) {
    console.log('\n  Run without --dry-run to actually optimize images.');
  }
}

main().catch(console.error);
