/**
 * Script para subir la imagen de fondo de FAQs a Supabase Storage
 * 
 * Uso: node scripts/upload-faqs-background.js [ruta_al_archivo]
 * Ejemplo: node scripts/upload-faqs-background.js "C:\Users\gimen\Downloads\Fondo FAQS.jpg"
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
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 
                     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWZvY2xqdGR2a2FiZnh3b3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgzMzc1NSwiZXhwIjoyMDgzNDA5NzU1fQ.2rvjw-91Be3RUaUdTg2fGi0LFUVoNDGApCfs0gmZYK0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'product-images';

async function uploadFAQsBackground(imagePath) {
  console.log('🚀 Subiendo imagen de fondo de FAQs a Supabase Storage...\n');

  // Si no se proporciona ruta, buscar en Descargas
  let filePath = imagePath;
  
  if (!filePath) {
    const downloadsPath = path.join(require('os').homedir(), 'Downloads');
    const possibleNames = [
      'Fondo FAQS.jpg',
      'Fondo FAQS.png',
      'Fondo FAQs.jpg',
      'Fondo FAQs.png',
      'Fondo_FAQS.jpg',
      'Fondo_FAQs.jpg',
      'Fondo FAQS.JPG',
      'Fondo FAQS.PNG',
    ];
    
    // Buscar archivos que contengan "fondo" y "faq" en el nombre
    try {
      const files = fs.readdirSync(downloadsPath);
      const matchingFiles = files.filter(file => {
        const lowerFile = file.toLowerCase();
        return (lowerFile.includes('fondo') && lowerFile.includes('faq')) ||
               (lowerFile.includes('faqs') && (lowerFile.endsWith('.jpg') || lowerFile.endsWith('.png') || lowerFile.endsWith('.jpeg')));
      });
      
      if (matchingFiles.length > 0) {
        filePath = path.join(downloadsPath, matchingFiles[0]);
        console.log(`📁 Encontrado: ${filePath}\n`);
      } else {
        // Intentar con nombres exactos
        for (const name of possibleNames) {
          const testPath = path.join(downloadsPath, name);
          if (fs.existsSync(testPath)) {
            filePath = testPath;
            console.log(`📁 Encontrado: ${filePath}\n`);
            break;
          }
        }
      }
    } catch (err) {
      console.log(`⚠️  No se pudo leer la carpeta Descargas: ${err.message}`);
    }
    
    if (!filePath) {
      console.error('❌ No se encontró el archivo de fondo de FAQs.');
      console.log('\n💡 Opciones:');
      console.log('   1. Pasa la ruta como argumento:');
      console.log('      node scripts/upload-faqs-background.js "C:\\Users\\gimen\\Downloads\\nombre-archivo.jpg"');
      console.log('   2. O coloca el archivo en Descargas con uno de estos nombres:');
      possibleNames.forEach(name => console.log(`      - ${name}`));
      console.log('\n📋 Archivos encontrados en Descargas:');
      try {
        const files = fs.readdirSync(downloadsPath).filter(f => 
          f.toLowerCase().endsWith('.jpg') || 
          f.toLowerCase().endsWith('.png') || 
          f.toLowerCase().endsWith('.jpeg')
        ).slice(0, 10);
        files.forEach(f => console.log(`   - ${f}`));
      } catch (e) {}
      process.exit(1);
    }
  }

  // Verificar que el archivo existe
  if (!fs.existsSync(filePath)) {
    console.error(`❌ El archivo no existe: ${filePath}`);
    process.exit(1);
  }

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

  // Leer el archivo
  console.log(`📸 Procesando: ${path.basename(filePath)}`);
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
  
  // Crear la carpeta faqs si no existe (subiendo a faqs/Fondo FAQS.jpg)
  const storagePath = `faqs/Fondo FAQS${ext}`;

  // Subir a Supabase
  console.log(`   ⬆️  Subiendo a Supabase Storage...`);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: contentType,
      upsert: true
    });

  if (error) {
    console.error(`   ❌ Error: ${error.message}`);
    process.exit(1);
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  console.log(`   ✅ Subido exitosamente!`);
  console.log(`\n📎 URL pública:`);
  console.log(`   ${urlData.publicUrl}`);
  console.log(`\n✅ La imagen ya está disponible en la página de FAQs!`);
}

// Obtener ruta del archivo desde argumentos de línea de comandos
const imagePath = process.argv[2];

uploadFAQsBackground(imagePath).catch(console.error);
