const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const SUPABASE_URL = 'https://vnefocljtdvkabfxwoqg.supabase.co';
// Usar la clave de servicio desde variable de entorno o la proporcionada
// IMPORTANTE: Para producción, usa siempre variables de entorno
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_O6i18n3Xh3MUDTEVCFlFpg_9TFMiwR8';

// Inicializar cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Ruta base de las imágenes
const IMAGES_BASE_PATH = path.join(__dirname, '..', 'public', 'images', 'categorias');

// Mapeo de nombres de carpetas a IDs de categorías
// Las claves son los nombres EXACTOS de las carpetas en el sistema de archivos
const categoryMapping = {
  'Arquitectura y diseño': {
    id: 'arquitectura-y-diseno',
    name: 'Arquitectura y Diseño',
    nameEn: 'Design & Architecture'
  },
  'Figuras Anatomicas': {
    id: 'figuras-anatomicas',
    name: 'Figuras Anatómicas',
    nameEn: 'Anatomical Figures'
  },
  'Mascaras Y Bustos': {
    id: 'mascaras-y-bustos',
    name: 'Máscaras y Bustos',
    nameEn: 'Masks & Busts'
  },
  'Relieves': {
    id: 'relieves',
    name: 'Relieves',
    nameEn: 'Reliefs'
  },
  'Torsos y Figuras': {
    id: 'torsos-y-figuras',
    name: 'Torsos y Figuras',
    nameEn: 'Torsos & Figures'
  },
  'Actualización Enero 2026': {
    id: 'actualizacion-enero-2026',
    name: 'Actualización Enero 2026',
    nameEn: 'January 2026 Update'
  }
};

// Función para ordenar imágenes priorizando las que tienen "DEF" en el nombre
function sortImagesByDef(images) {
  return images.sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    
    // PRIORIDAD: Imágenes con "DEF" en el nombre van primero
    const aIsDef = aLower.includes('def');
    const bIsDef = bLower.includes('def');
    
    if (aIsDef && !bIsDef) return -1;
    if (bIsDef && !aIsDef) return 1;
    
    // Si ambas tienen DEF o ninguna, ordenar alfabéticamente
    return aLower.localeCompare(bLower);
  });
}

// Función para obtener todas las imágenes de una carpeta
function getImagesInFolder(folderPath) {
  const images = [];
  try {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          images.push({
            name: file,
            path: filePath,
            size: stat.size
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error leyendo carpeta ${folderPath}:`, error.message);
  }
  
  // Ordenar imágenes: las que tienen "DEF" van primero
  return sortImagesByDef(images);
}

// Función para subir una imagen a Supabase Storage
async function uploadImageToStorage(categoryId, productCode, imageName, imagePath) {
  const storagePath = `${categoryId}/${productCode}/${imageName}`;
  
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileExt = path.extname(imageName);
    const fileName = path.basename(imageName, fileExt);
    const contentType = fileExt === '.jpg' || fileExt === '.jpeg' ? 'image/jpeg' :
                       fileExt === '.png' ? 'image/png' :
                       fileExt === '.gif' ? 'image/gif' :
                       'image/webp';

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: contentType,
        upsert: true // Sobrescribe si ya existe
      });

    if (error) {
      console.error(`Error subiendo imagen ${imageName}:`, error.message);
      return null;
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error procesando imagen ${imageName}:`, error.message);
    return null;
  }
}

// Función para extraer código y nombre del producto desde el nombre de la carpeta
function parseProductFolder(folderName) {
  // Formato esperado: "AD001 - Peana Clasica" o "AD-001 - Peana Clasica"
  const match = folderName.match(/^([A-Z]+-?\d+)\s*-\s*(.+)$/);
  if (match) {
    return {
      code: match[1].replace(/-/g, ''), // Normalizar código (quitar guiones)
      name: match[2].trim()
    };
  }
  
  // Si no coincide el formato, intentar extraer código al inicio
  const codeMatch = folderName.match(/^([A-Z]+-?\d+)/);
  if (codeMatch) {
    return {
      code: codeMatch[1].replace(/-/g, ''),
      name: folderName.replace(/^[A-Z]+-?\d+\s*-\s*/, '').trim() || folderName
    };
  }
  
  // Si no hay código, usar el nombre de la carpeta
  return {
    code: folderName.replace(/\s+/g, '-').toUpperCase(),
    name: folderName
  };
}

// Función para crear o actualizar una categoría
async function upsertCategory(category) {
  const { data, error } = await supabase
    .from('categories')
    .upsert({
      id: category.id,
      name: category.name,
      name_en: category.nameEn,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error(`Error creando categoría ${category.id}:`, error.message);
    return null;
  }

  return data;
}

// Función para crear o actualizar un producto
async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert({
      code: product.code,
      category_id: product.categoryId,
      name: product.name,
      folder_name: product.folderName,
      price: product.price || null,
      artist: product.artist || null,
      dimensions: product.dimensions || null,
      description: product.description || null,
      images: product.images || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'code'
    })
    .select()
    .single();

  if (error) {
    console.error(`Error creando producto ${product.code}:`, error.message);
    return null;
  }

  return data;
}

// Función principal para procesar una categoría
async function processCategory(categoryFolderName) {
  const categoryInfo = categoryMapping[categoryFolderName];
  
  if (!categoryInfo) {
    console.log(`⚠️  Categoría desconocida: ${categoryFolderName}, saltando...`);
    return;
  }

  console.log(`\n📁 Procesando categoría: ${categoryInfo.name} (${categoryInfo.id})`);

  // Crear/actualizar categoría en la base de datos
  const category = await upsertCategory(categoryInfo);
  if (!category) {
    console.error(`❌ No se pudo crear la categoría ${categoryInfo.id}`);
    return;
  }
  console.log(`✅ Categoría creada/actualizada: ${categoryInfo.name}`);

  // Ruta de la carpeta de la categoría
  const categoryPath = path.join(IMAGES_BASE_PATH, categoryFolderName);

  if (!fs.existsSync(categoryPath)) {
    console.log(`⚠️  La carpeta ${categoryPath} no existe`);
    return;
  }

  // Leer subcarpetas (productos)
  const productFolders = fs.readdirSync(categoryPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`   Encontrados ${productFolders.length} productos`);

  // Procesar cada producto
  for (const productFolderName of productFolders) {
    const productPath = path.join(categoryPath, productFolderName);
    const { code, name } = parseProductFolder(productFolderName);

    console.log(`\n   📦 Procesando producto: ${code} - ${name}`);

    // Obtener todas las imágenes del producto
    const images = getImagesInFolder(productPath);
    
    if (images.length === 0) {
      console.log(`      ⚠️  No se encontraron imágenes en ${productFolderName}`);
      
      // Crear producto sin imágenes
      await upsertProduct({
        code,
        categoryId: categoryInfo.id,
        name,
        folderName: productFolderName,
        images: []
      });
      continue;
    }

    console.log(`      📸 Encontradas ${images.length} imágenes`);

    // Subir todas las imágenes
    const imageUrls = [];
    for (const image of images) {
      console.log(`      ⬆️  Subiendo: ${image.name}`);
      const url = await uploadImageToStorage(categoryInfo.id, code, image.name, image.path);
      if (url) {
        imageUrls.push(url);
        console.log(`      ✅ Subida: ${image.name}`);
      } else {
        console.log(`      ❌ Error subiendo: ${image.name}`);
      }
    }

    // Crear/actualizar producto en la base de datos
    const product = await upsertProduct({
      code,
      categoryId: categoryInfo.id,
      name,
      folderName: productFolderName,
      images: imageUrls
    });

    if (product) {
      console.log(`      ✅ Producto creado/actualizado: ${code}`);
    } else {
      console.log(`      ❌ Error creando producto: ${code}`);
    }
  }
}

// Función para verificar si las tablas existen
async function checkTablesExist() {
  try {
    // Intentar hacer una consulta simple a categories
    const { error } = await supabase.from('categories').select('id').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
}

// Función para mostrar instrucciones de creación de tablas
function showTableCreationInstructions() {
  const sqlPath = path.join(__dirname, 'supabase-schema.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ No se encontró el archivo SQL: ${sqlPath}`);
    return;
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('\n' + '═'.repeat(70));
  console.log('📝 INSTRUCCIONES PARA CREAR LAS TABLAS');
  console.log('═'.repeat(70));
  console.log('\n1. Ve a https://app.supabase.com');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Abre "SQL Editor" en el menú lateral');
  console.log('4. Copia y pega el siguiente contenido:\n');
  console.log('─'.repeat(70));
  console.log(sqlContent);
  console.log('─'.repeat(70));
  console.log('\n5. Haz clic en "Run" (o presiona Ctrl+Enter) para ejecutar el script');
  console.log('6. Verifica que se hayan creado las tablas "categories" y "products"');
  console.log('7. Vuelve a ejecutar este script: node scripts/upload-to-supabase.js\n');
  console.log('═'.repeat(70) + '\n');
}

// Función principal
async function main() {
  console.log('🚀 Iniciando carga de imágenes a Supabase...\n');

  // Verificar que existe la carpeta base
  if (!fs.existsSync(IMAGES_BASE_PATH)) {
    console.error(`❌ Error: La carpeta ${IMAGES_BASE_PATH} no existe`);
    process.exit(1);
  }

  // Verificar conexión a Supabase
  console.log('🔌 Verificando conexión a Supabase...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error conectando a Supabase:', bucketsError.message);
    console.error('   Verifica que SUPABASE_SERVICE_KEY esté configurado correctamente');
    process.exit(1);
  }

  console.log('✅ Conexión a Supabase establecida');

  // Verificar si las tablas existen
  console.log('🔍 Verificando si las tablas existen...');
  const tablesExist = await checkTablesExist();
  
  if (!tablesExist) {
    console.log('⚠️  Las tablas no existen.\n');
    showTableCreationInstructions();
    console.log('❌ Por favor, crea las tablas primero y luego vuelve a ejecutar este script.\n');
    process.exit(1);
  } else {
    console.log('✅ Las tablas ya existen');
  }

  // Verificar que existe el bucket 'product-images'
  const bucketExists = buckets.some(b => b.name === 'product-images');
  if (!bucketExists) {
    console.log('⚠️  El bucket "product-images" no existe. Creándolo...');
    const { error: createError } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (createError) {
      console.error('❌ Error creando bucket:', createError.message);
      process.exit(1);
    }
    console.log('✅ Bucket "product-images" creado');
  }

  // Leer todas las categorías
  const categoryFolders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`\n📂 Encontradas ${categoryFolders.length} categorías`);

  // Procesar cada categoría
  for (const categoryFolder of categoryFolders) {
    await processCategory(categoryFolder);
  }

  console.log('\n✨ ¡Proceso completado!');
}

// Ejecutar script
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

