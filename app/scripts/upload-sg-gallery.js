/**
 * Script para subir las imágenes de THE SG GALLERY a Supabase Storage
 * y crear las colecciones y fotos en la base de datos
 * 
 * Uso: node scripts/upload-sg-gallery.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Función para cargar .env manualmente
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remover comillas si existen
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

// Configuración de Supabase
const SUPABASE_URL = 'https://vnefocljtdvkabfxwoqg.supabase.co';
// Service Role Key para permisos de administrador
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 
                     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWZvY2xqdGR2a2FiZnh3b3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgzMzc1NSwiZXhwIjoyMDgzNDA5NzU1fQ.2rvjw-91Be3RUaUdTg2fGi0LFUVoNDGApCfs0gmZYK0';

console.log('🔑 Usando Service Role Key');
console.log('   URL: ' + SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Directorio de imágenes
const SG_GALLERY_DIR = path.join(__dirname, '..', 'public', 'images', 'THE SG GALLERY');

// Configuración de colecciones
const COLLECTIONS_CONFIG = {
  'The Studio Collection': {
    slug: 'the-studio-collection',
    description: 'Una mirada íntima al proceso creativo en nuestro taller. Esculturas clásicas capturadas en su entorno de trabajo.',
    order: 1
  },
  'Michelangelo Collection': {
    slug: 'michelangelo-collection',
    description: 'Homenaje a las obras maestras de Miguel Ángel Buonarroti. Reproducciones fieles de sus esculturas más icónicas.',
    order: 2
  },
  'Golden Collection': {
    slug: 'golden-collection',
    description: 'Piezas bañadas en luz dorada. Una colección que celebra la belleza atemporal del arte clásico.',
    order: 3
  },
  'L_Empordà Collection': {
    slug: 'lemporda-collection',
    description: 'Inspiración mediterránea desde el corazón de Catalunya. Arte clásico en un entorno único.',
    order: 4
  }
};

// Extensiones de imagen válidas
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Genera un slug para el nombre de archivo
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Genera un título legible desde el nombre de archivo
 */
function generateTitle(filename) {
  // Remover extensión
  const name = path.parse(filename).name;
  
  // Limpiar el nombre
  return name
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\(.*?\)/g, '')
    .trim();
}

/**
 * Sube una imagen a Supabase Storage
 */
async function uploadImage(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(storagePath, fileBuffer, {
      contentType: contentTypes[ext] || 'image/jpeg',
      upsert: true
    });
    
  if (error) {
    throw error;
  }
  
  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(storagePath);
    
  return urlData.publicUrl;
}

/**
 * Procesa una colección
 */
async function processCollection(collectionName, collectionDir) {
  const config = COLLECTIONS_CONFIG[collectionName];
  
  if (!config) {
    console.log(`⚠️  Colección no configurada: ${collectionName}, usando valores por defecto`);
  }
  
  const slug = config?.slug || slugify(collectionName);
  const description = config?.description || '';
  const order = config?.order || 99;
  
  console.log(`\n📁 Procesando colección: ${collectionName}`);
  console.log(`   Slug: ${slug}`);
  
  // Leer archivos de la colección
  const files = fs.readdirSync(collectionDir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return VALID_EXTENSIONS.includes(ext);
    })
    .sort();
  
  if (files.length === 0) {
    console.log(`   ⚠️  No se encontraron imágenes`);
    return null;
  }
  
  console.log(`   📷 ${files.length} imágenes encontradas`);
  
  // Subir la primera imagen como portada
  const coverFile = files[0];
  const coverLocalPath = path.join(collectionDir, coverFile);
  const coverStoragePath = `sg-gallery/covers/${slug}${path.extname(coverFile).toLowerCase()}`;
  
  console.log(`   🖼️  Subiendo portada: ${coverFile}`);
  let coverUrl;
  try {
    coverUrl = await uploadImage(coverLocalPath, coverStoragePath);
    console.log(`   ✅ Portada subida`);
  } catch (err) {
    console.error(`   ❌ Error subiendo portada: ${err.message}`);
    return null;
  }
  
  // Crear o actualizar la colección en la base de datos
  const { data: collection, error: collectionError } = await supabase
    .from('sg_gallery_collections')
    .upsert({
      name: collectionName,
      slug: slug,
      description: description,
      cover_image: coverUrl,
      display_order: order,
      is_active: true
    }, {
      onConflict: 'slug'
    })
    .select()
    .single();
  
  if (collectionError) {
    console.error(`   ❌ Error creando colección: ${collectionError.message}`);
    return null;
  }
  
  console.log(`   ✅ Colección creada/actualizada (ID: ${collection.id})`);
  
  // Subir todas las fotos
  console.log(`   📤 Subiendo fotos...`);
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const localPath = path.join(collectionDir, file);
    const storagePath = `sg-gallery/photos/${slug}/${slugify(path.parse(file).name)}${path.extname(file).toLowerCase()}`;
    
    try {
      const imageUrl = await uploadImage(localPath, storagePath);
      
      // Crear la foto en la base de datos
      const title = generateTitle(file);
      
      const { error: photoError } = await supabase
        .from('sg_gallery_photos')
        .upsert({
          collection_id: collection.id,
          title: title || `Foto ${i + 1}`,
          description: '',
          context_info: '',
          image_url: imageUrl,
          display_order: i,
          is_active: true
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (photoError) {
        console.log(`      ⚠️  ${file}: Error BD - ${photoError.message}`);
      } else {
        console.log(`      ✅ ${file}`);
      }
    } catch (err) {
      console.log(`      ❌ ${file}: ${err.message}`);
    }
  }
  
  return collection;
}

/**
 * Función principal
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🎨 THE SG GALLERY - Importador de Imágenes');
  console.log('='.repeat(60));
  console.log(`📂 Directorio: ${SG_GALLERY_DIR}`);
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');
  
  // Verificar que existe el directorio
  if (!fs.existsSync(SG_GALLERY_DIR)) {
    console.error(`❌ No se encontró el directorio: ${SG_GALLERY_DIR}`);
    process.exit(1);
  }
  
  // Leer las colecciones (carpetas)
  const collections = fs.readdirSync(SG_GALLERY_DIR)
    .filter(item => {
      const itemPath = path.join(SG_GALLERY_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    })
    .sort((a, b) => {
      // Ordenar por el orden configurado
      const orderA = COLLECTIONS_CONFIG[a]?.order || 99;
      const orderB = COLLECTIONS_CONFIG[b]?.order || 99;
      return orderA - orderB;
    });
  
  console.log(`📚 ${collections.length} colecciones encontradas:`);
  collections.forEach(c => console.log(`   - ${c}`));
  
  // Procesar cada colección
  let successCount = 0;
  for (const collectionName of collections) {
    const collectionDir = path.join(SG_GALLERY_DIR, collectionName);
    const result = await processCollection(collectionName, collectionDir);
    if (result) successCount++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Proceso completado: ${successCount}/${collections.length} colecciones procesadas`);
  console.log('='.repeat(60));
  console.log('');
  console.log('📌 Próximos pasos:');
  console.log('   1. Verifica las imágenes en Supabase Storage > product-images > sg-gallery/');
  console.log('   2. Accede a la web: http://localhost:3000/sg-gallery');
  console.log('   3. Usa el BackOffice para editar títulos y descripciones');
  console.log('');
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
