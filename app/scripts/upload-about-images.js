const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const SUPABASE_URL = 'https://vnefocljtdvkabfxwoqg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_O6i18n3Xh3MUDTEVCFlFpg_9TFMiwR8';

// Inicializar cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Imágenes a subir
const ABOUT_IMAGES = [
  { name: 'taller', file: 'taller.jpg', description: 'Foto del taller de vaciados' },
  { name: 'espacios', file: 'espacios.jpg', description: 'Foto de transformación de espacios' },
  { name: 'javier', file: 'javier.jpg', description: 'Foto de Javier / About Me' },
];

const ABOUT_IMAGES_PATH = path.join(__dirname, '..', 'public', 'images', 'about');
const BUCKET_NAME = 'product-images';

async function uploadAboutImages() {
  console.log('🚀 Subiendo imágenes de About Us a Supabase Storage...\n');

  // Verificar conexión a Supabase
  console.log('🔌 Verificando conexión a Supabase...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error conectando a Supabase:', bucketsError.message);
    process.exit(1);
  }

  console.log('✅ Conexión a Supabase establecida\n');

  // Verificar que existe el bucket
  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`⚠️  El bucket "${BUCKET_NAME}" no existe. Creándolo...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (createError) {
      console.error('❌ Error creando bucket:', createError.message);
      process.exit(1);
    }
    console.log(`✅ Bucket "${BUCKET_NAME}" creado\n`);
  }

  const uploadedUrls = {};
  let successCount = 0;
  let errorCount = 0;

  for (const image of ABOUT_IMAGES) {
    const filePath = path.join(ABOUT_IMAGES_PATH, image.file);
    
    console.log(`📸 Procesando: ${image.file} (${image.description})`);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Archivo no encontrado: ${filePath}`);
      console.log(`   💡 Crea el archivo en: public/images/about/${image.file}\n`);
      errorCount++;
      continue;
    }

    // Leer el archivo
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `about/${image.file}`;

    // Subir a Supabase
    console.log(`   ⬆️  Subiendo a Supabase...`);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      errorCount++;
      continue;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    uploadedUrls[image.name] = urlData.publicUrl;
    console.log(`   ✅ Subido: ${urlData.publicUrl}\n`);
    successCount++;
  }

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Subidas: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  
  if (Object.keys(uploadedUrls).length > 0) {
    console.log('\n📎 URLs para usar en el código:\n');
    console.log('const aboutImages = {');
    for (const [name, url] of Object.entries(uploadedUrls)) {
      console.log(`  ${name}: "${url}",`);
    }
    console.log('};');
  }

  if (errorCount > 0) {
    console.log('\n⚠️  Algunas imágenes no se subieron.');
    console.log('   Asegúrate de poner los archivos en: public/images/about/');
    console.log('   Archivos necesarios: taller.jpg, espacios.jpg, javier.jpg');
  }
}

uploadAboutImages().catch(console.error);
