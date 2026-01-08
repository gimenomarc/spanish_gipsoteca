const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const SUPABASE_URL = 'https://vnefocljtdvkabfxwoqg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_O6i18n3Xh3MUDTEVCFlFpg_9TFMiwR8';

// Inicializar cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Ruta de la imagen hero
const HERO_IMAGE_PATH = path.join(__dirname, '..', 'public', 'images', 'hero', 'hero-bg.jpg');

async function uploadHeroImage() {
  console.log('🚀 Subiendo imagen hero a Supabase Storage...\n');

  // Verificar que el archivo existe
  if (!fs.existsSync(HERO_IMAGE_PATH)) {
    console.error(`❌ Error: El archivo ${HERO_IMAGE_PATH} no existe`);
    console.log('   Asegúrate de que la imagen esté en public/images/hero/hero-bg.jpg');
    process.exit(1);
  }

  // Verificar conexión a Supabase
  console.log('🔌 Verificando conexión a Supabase...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error conectando a Supabase:', bucketsError.message);
    process.exit(1);
  }

  console.log('✅ Conexión a Supabase establecida');

  // Verificar que existe el bucket 'product-images' o crear uno nuevo para assets
  const bucketName = 'product-images'; // Usar el mismo bucket o crear 'assets'
  const bucketExists = buckets.some(b => b.name === bucketName);
  
  if (!bucketExists) {
    console.log(`⚠️  El bucket "${bucketName}" no existe. Creándolo...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (createError) {
      console.error('❌ Error creando bucket:', createError.message);
      process.exit(1);
    }
    console.log(`✅ Bucket "${bucketName}" creado`);
  }

  // Leer el archivo
  console.log('📸 Leyendo imagen...');
  const fileBuffer = fs.readFileSync(HERO_IMAGE_PATH);
  const storagePath = 'hero/hero-bg.jpg';

  // Subir la imagen
  console.log('⬆️  Subiendo imagen a Supabase Storage...');
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true // Sobrescribe si ya existe
    });

  if (error) {
    console.error('❌ Error subiendo imagen:', error.message);
    process.exit(1);
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(storagePath);

  console.log('\n✅ ¡Imagen subida exitosamente!');
  console.log(`📎 URL pública: ${urlData.publicUrl}`);
  console.log('\n📝 Ahora actualiza el código para usar esta URL:');
  console.log(`   const images = { hero: "${urlData.publicUrl}" };`);
  console.log('\n   O usa la función optimizeImageUrl para optimizarla:');
  console.log(`   const images = { hero: optimizeImageUrl("${urlData.publicUrl}", { width: 1920, quality: 85, format: 'webp' }) };`);
}

uploadHeroImage().catch(console.error);
