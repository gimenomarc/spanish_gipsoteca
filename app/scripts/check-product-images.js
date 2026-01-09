/**
 * Script para verificar qué productos tienen o no tienen imágenes
 * 
 * Uso: node scripts/check-product-images.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductImages() {
  console.log('🔍 Verificando productos y sus imágenes...\n');

  // Obtener todos los productos
  const { data: products, error } = await supabase
    .from('products')
    .select('code, name, category_id, images, price, description')
    .order('category_id')
    .order('code');

  if (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    return;
  }

  console.log(`📦 Total productos en base de datos: ${products.length}\n`);

  // Clasificar productos
  const withImages = [];
  const withoutImages = [];
  const withData = [];
  const withoutData = [];

  for (const product of products) {
    const hasImages = product.images && product.images.length > 0;
    const hasData = product.price || product.description;

    if (hasImages) {
      withImages.push(product);
    } else {
      withoutImages.push(product);
    }

    if (hasData) {
      withData.push(product);
    } else {
      withoutData.push(product);
    }
  }

  // Resumen
  console.log('=' .repeat(70));
  console.log('📊 RESUMEN');
  console.log('='.repeat(70));
  console.log(`✅ Productos CON imágenes: ${withImages.length}`);
  console.log(`❌ Productos SIN imágenes: ${withoutImages.length}`);
  console.log(`📝 Productos CON datos (precio/descripción): ${withData.length}`);
  console.log(`⚠️  Productos SIN datos: ${withoutData.length}`);
  console.log('');

  // Productos sin imágenes
  if (withoutImages.length > 0) {
    console.log('='.repeat(70));
    console.log('❌ PRODUCTOS SIN IMÁGENES (necesitan carpeta de fotos):');
    console.log('='.repeat(70));
    
    let currentCategory = '';
    for (const p of withoutImages) {
      if (p.category_id !== currentCategory) {
        currentCategory = p.category_id;
        console.log(`\n📁 ${currentCategory.toUpperCase()}`);
      }
      const hasData = p.price || p.description ? '✅' : '⚠️';
      console.log(`   ${hasData} ${p.code} - ${p.name}`);
    }
  }

  // Productos sin datos
  if (withoutData.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  PRODUCTOS SIN DATOS (no están en el Excel o faltan datos):');
    console.log('='.repeat(70));
    
    let currentCategory = '';
    for (const p of withoutData) {
      if (p.category_id !== currentCategory) {
        currentCategory = p.category_id;
        console.log(`\n📁 ${currentCategory.toUpperCase()}`);
      }
      const hasImages = p.images && p.images.length > 0 ? '🖼️' : '❌';
      console.log(`   ${hasImages} ${p.code} - ${p.name}`);
    }
  }

  // Instrucciones
  console.log('\n' + '='.repeat(70));
  console.log('📋 PARA AGREGAR IMÁGENES A UN PRODUCTO:');
  console.log('='.repeat(70));
  console.log('1. Crea una carpeta en: public/images/categorias/[categoria]/');
  console.log('   Con el formato: [CODIGO - Nombre]');
  console.log('   Ejemplo: public/images/categorias/mascaras-y-bustos/CB003 - Cabeza de nino/');
  console.log('');
  console.log('2. Pon las fotos JPG dentro de esa carpeta');
  console.log('   (Nombre recomendado: imagen con número bajo = fondo negro)');
  console.log('');
  console.log('3. Ejecuta: node scripts/upload-to-supabase.js');
  console.log('');
}

checkProductImages().catch(console.error);
