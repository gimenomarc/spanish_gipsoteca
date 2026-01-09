/**
 * Script para OPTIMIZAR y SUBIR imágenes a Supabase
 * 
 * Este script:
 * 1. Lee las imágenes originales de las carpetas
 * 2. Genera 2 versiones:
 *    - THUMBNAIL: 400x533px (para grid de tienda) - ~30-50KB
 *    - FULL: 1200x1600px (para detalle) - ~150-250KB
 * 3. Sube ambas versiones a Supabase Storage
 * 4. Guarda las URLs en la base de datos
 * 
 * Uso: node scripts/optimize-and-upload-images.js
 */

require('dotenv').config();
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// Usar Service Role Key para tener permisos de escritura
// Si no está configurada, usar la anon key (requiere políticas de storage configuradas)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: No se encontró clave de Supabase');
  console.error('   Configura SUPABASE_SERVICE_ROLE_KEY o REACT_APP_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const IMAGES_BASE_PATH = path.join(__dirname, '..', 'public', 'images', 'categorias');
const BUCKET_NAME = 'product-images';

// Configuración de optimización
const IMAGE_CONFIGS = {
  // Thumbnail para grid de tienda (cards)
  thumb: {
    width: 400,
    height: 533, // Aspect ratio 3:4
    quality: 75,
    suffix: '_thumb',
  },
  // Imagen completa para detalle de producto
  full: {
    width: 1200,
    height: 1600, // Aspect ratio 3:4
    quality: 85,
    suffix: '_full',
  },
};

// Mapeo de categorías
const categoryMapping = {
  'Arquitectura y diseño': 'arquitectura-y-diseno',
  'Figuras Anatomicas': 'figuras-anatomicas',
  'Mascaras Y Bustos': 'mascaras-y-bustos',
  'Relieves': 'relieves',
  'Torsos y Figuras': 'torsos-y-figuras',
};

// Función para ordenar imágenes (DEF primero)
function sortImagesByDef(images) {
  return images.sort((a, b) => {
    const aIsDef = a.name.toLowerCase().includes('def');
    const bIsDef = b.name.toLowerCase().includes('def');
    if (aIsDef && !bIsDef) return -1;
    if (bIsDef && !aIsDef) return 1;
    return a.name.localeCompare(b.name);
  });
}

// Función para optimizar una imagen
async function optimizeImage(inputPath, config) {
  try {
    const buffer = await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: config.quality })
      .toBuffer();
    
    return buffer;
  } catch (error) {
    console.error(`Error optimizando ${inputPath}:`, error.message);
    return null;
  }
}

// Función para subir imagen a Supabase
async function uploadToSupabase(buffer, storagePath) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 año de caché
        upsert: true, // Sobrescribir si existe
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return publicUrl;
  } catch (error) {
    console.error(`Error subiendo ${storagePath}:`, error.message);
    return null;
  }
}

// Función para obtener imágenes de una carpeta
function getImagesInFolder(folderPath) {
  const images = [];
  try {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          images.push({
            name: file,
            path: filePath,
            size: stat.size,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error leyendo ${folderPath}:`, error.message);
  }
  return sortImagesByDef(images);
}

// Función principal
async function main() {
  console.log('🚀 Optimizando y subiendo imágenes a Supabase...\n');
  console.log('📊 Configuración:');
  console.log(`   Thumbnail: ${IMAGE_CONFIGS.thumb.width}x${IMAGE_CONFIGS.thumb.height}px, Q${IMAGE_CONFIGS.thumb.quality}`);
  console.log(`   Full: ${IMAGE_CONFIGS.full.width}x${IMAGE_CONFIGS.full.height}px, Q${IMAGE_CONFIGS.full.quality}\n`);

  // Obtener categorías
  const categoryFolders = fs.readdirSync(IMAGES_BASE_PATH).filter(f => {
    const stat = fs.statSync(path.join(IMAGES_BASE_PATH, f));
    return stat.isDirectory() && categoryMapping[f];
  });

  console.log(`📂 Categorías encontradas: ${categoryFolders.length}\n`);

  let totalProducts = 0;
  let totalImages = 0;
  let errors = 0;

  for (const categoryFolder of categoryFolders) {
    const categoryId = categoryMapping[categoryFolder];
    const categoryPath = path.join(IMAGES_BASE_PATH, categoryFolder);
    
    console.log(`\n📁 ${categoryFolder} → ${categoryId}`);

    // Obtener subcarpetas (productos)
    const productFolders = fs.readdirSync(categoryPath).filter(f => {
      return fs.statSync(path.join(categoryPath, f)).isDirectory();
    });

    for (const productFolder of productFolders) {
      // Extraer código del producto del nombre de la carpeta
      const productCode = productFolder.split(' - ')[0].trim().toUpperCase();
      if (!productCode) continue;

      const productPath = path.join(categoryPath, productFolder);
      const images = getImagesInFolder(productPath);
      
      if (images.length === 0) continue;

      console.log(`   📦 ${productCode}: ${images.length} imágenes`);
      totalProducts++;

      const uploadedUrls = [];

      for (const image of images) {
        const baseName = path.basename(image.name, path.extname(image.name));
        const originalSizeKB = Math.round(image.size / 1024);
        
        // Generar y subir THUMBNAIL
        const thumbBuffer = await optimizeImage(image.path, IMAGE_CONFIGS.thumb);
        if (thumbBuffer) {
          const thumbPath = `${categoryId}/${productCode}/${baseName}_thumb.webp`;
          const thumbUrl = await uploadToSupabase(thumbBuffer, thumbPath);
          if (thumbUrl) {
            const thumbSizeKB = Math.round(thumbBuffer.length / 1024);
            console.log(`      ✓ Thumb: ${originalSizeKB}KB → ${thumbSizeKB}KB (-${Math.round((1 - thumbSizeKB/originalSizeKB) * 100)}%)`);
          }
        }

        // Generar y subir FULL
        const fullBuffer = await optimizeImage(image.path, IMAGE_CONFIGS.full);
        if (fullBuffer) {
          const fullPath = `${categoryId}/${productCode}/${baseName}_full.webp`;
          const fullUrl = await uploadToSupabase(fullBuffer, fullPath);
          if (fullUrl) {
            uploadedUrls.push(fullUrl);
            totalImages++;
          }
        }
      }

      // Actualizar producto en base de datos con las URLs
      if (uploadedUrls.length > 0) {
        const { error } = await supabase
          .from('products')
          .update({ images: uploadedUrls })
          .eq('code', productCode);

        if (error) {
          console.log(`      ❌ Error actualizando DB: ${error.message}`);
          errors++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Productos procesados: ${totalProducts}`);
  console.log(`🖼️  Imágenes subidas: ${totalImages}`);
  console.log(`❌ Errores: ${errors}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
