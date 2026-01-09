/**
 * Script para importar productos desde Excel a Supabase
 * 
 * Uso: node scripts/import-products-excel.js
 * 
 * El Excel debe estar en: public/data/Productos_Enero.xlsx
 * 
 * Columnas esperadas:
 * - Columna1: Código del producto (ej: A001, MB001, R001)
 * - Nombre de la pieza: Nombre del producto
 * - Tipología: Tipo/categoría del producto
 * - Fecha: Fecha de la obra original
 * - Autoría: Artista/autor
 * - Dimensiones: Dimensiones de la pieza
 * - PVP: Precio de venta
 * - Catálogo: Información adicional del catálogo
 * - Descripcion productos: Descripción detallada
 */

require('dotenv').config();
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('   Asegúrate de tener REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Ruta al archivo Excel
const EXCEL_PATH = path.join(__dirname, '..', 'public', 'data', 'Productos_Enero.xlsx');

// Mapeo de tipologías a category_id (ajustar según tu base de datos)
const CATEGORY_MAP = {
  'figuras anatómicas': 'figuras-anatomicas',
  'figuras anatomicas': 'figuras-anatomicas',
  'anatomía': 'figuras-anatomicas',
  'anatomia': 'figuras-anatomicas',
  'máscaras y bustos': 'mascaras-y-bustos',
  'mascaras y bustos': 'mascaras-y-bustos',
  'máscaras': 'mascaras-y-bustos',
  'mascaras': 'mascaras-y-bustos',
  'bustos': 'mascaras-y-bustos',
  'relieves': 'relieves',
  'relieve': 'relieves',
  'torsos y figuras': 'torsos-y-figuras',
  'torsos': 'torsos-y-figuras',
  'figuras': 'torsos-y-figuras',
  'arquitectura y diseño': 'arquitectura-y-diseno',
  'arquitectura y diseno': 'arquitectura-y-diseno',
  'arquitectura': 'arquitectura-y-diseno',
  'diseño': 'arquitectura-y-diseno',
  'diseno': 'arquitectura-y-diseno',
};

// Función para normalizar el código del producto
function normalizeCode(code) {
  if (!code) return null;
  // Limpiar espacios y convertir a mayúsculas
  return String(code).trim().toUpperCase();
}

// Función para normalizar el precio
function normalizePrice(price) {
  if (!price) return null;
  // Convertir a string y limpiar
  let priceStr = String(price).trim();
  // Si ya tiene formato correcto, devolverlo
  if (priceStr.includes('€')) return priceStr;
  // Intentar extraer número
  const num = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (isNaN(num)) return priceStr;
  // Formatear como precio
  return `${num.toFixed(2).replace('.', ',')} €`;
}

// Función para encontrar la categoría
function findCategoryId(tipologia) {
  if (!tipologia) return null;
  const normalized = String(tipologia).toLowerCase().trim();
  return CATEGORY_MAP[normalized] || null;
}

// Función principal
async function importProducts() {
  console.log('🚀 Importando productos desde Excel a Supabase...\n');

  // Verificar que el archivo existe
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ Error: No se encontró el archivo Excel en: ${EXCEL_PATH}`);
    process.exit(1);
  }

  console.log(`📂 Leyendo archivo: ${EXCEL_PATH}\n`);

  // Leer el archivo Excel CON estilos para detectar colores
  const workbook = XLSX.readFile(EXCEL_PATH, { cellStyles: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir a JSON (raw para procesar manualmente)
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  console.log(`📊 Total filas en el Excel: ${rawData.length}\n`);

  // Encontrar la fila de encabezados (buscar fila que contenga "Nombre de la pieza" o similar)
  let headerRowIndex = -1;
  let headers = [];
  
  for (let i = 0; i < Math.min(rawData.length, 10); i++) {
    const row = rawData[i];
    const rowStr = row.join(' ').toLowerCase();
    if (rowStr.includes('nombre') || rowStr.includes('pieza') || rowStr.includes('tipolog')) {
      headerRowIndex = i;
      headers = row.map(h => String(h).trim());
      break;
    }
  }

  if (headerRowIndex === -1) {
    // Si no encontramos encabezados, asumir que la primera fila son los encabezados
    headerRowIndex = 0;
    headers = rawData[0].map(h => String(h).trim());
  }

  console.log(`📋 Encabezados encontrados en fila ${headerRowIndex + 1}:`);
  console.log(`   ${headers.join(' | ')}\n`);

  // Convertir el resto de filas a objetos usando los encabezados
  const data = [];
  
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    // Saltar filas vacías
    if (!row || row.every(cell => !cell || String(cell).trim() === '')) continue;
    
    const obj = {};
    headers.forEach((header, idx) => {
      if (header) {
        obj[header] = row[idx] !== undefined ? row[idx] : '';
      }
    });
    
    // Añadir a data si tiene código
    const code = obj['Columna1'] || obj['Código'] || obj['Code'] || '';
    if (code && String(code).trim()) {
      data.push(obj);
    }
  }

  console.log(`📦 Productos encontrados en Excel: ${data.length}\n`);

  // Mostrar las primeras filas para debug
  if (data.length > 0) {
    console.log('📝 Ejemplo de primera fila de datos:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\n');
  }

  // Contadores
  let updated = 0;
  let created = 0;
  let errors = 0;
  let skipped = 0;

  // Procesar cada producto
  for (const row of data) {
    // Detectar el código del producto (puede estar en diferentes columnas)
    const code = normalizeCode(
      row['Columna1'] || 
      row['Código'] || 
      row['Codigo'] || 
      row['Code'] || 
      row['REF'] ||
      row['Referencia']
    );

    if (!code) {
      console.log(`⚠️ Fila sin código, saltando...`);
      skipped++;
      continue;
    }

    // Extraer datos del Excel (nota: "Autoría " tiene espacio al final en el Excel)
    const nombre = row['Nombre de la pieza'] || row['Nombre'] || row['Name'] || '';
    const tipologia = row['Tipología'] || row['Tipologia'] || row['Tipo'] || '';
    const fecha = row['Fecha'] || row['Date'] || '';
    const autoria = row['Autoría '] || row['Autoría'] || row['Autoria'] || row['Autor'] || row['Artist'] || '';
    const dimensiones = row['Dimensiones'] || row['Dimensions'] || '';
    const pvp = row['PVP'] || row['Precio'] || row['Price'] || '';
    const catalogo = row['Catálogo'] || row['Catalogo'] || '';
    const descripcion = row['Descripcion productos'] || row['Descripcion'] || row['Descripción'] || row['Description'] || '';

    // Buscar categoría basada en tipología o en el código del producto
    let categoryId = findCategoryId(tipologia);
    
    // Si no se encontró categoría por tipología, intentar por prefijo del código
    if (!categoryId) {
      const prefixMap = {
        'A': 'figuras-anatomicas',
        'MB': 'mascaras-y-bustos',
        'M': 'mascaras-y-bustos',
        'CB': 'mascaras-y-bustos',  // Cabezas/Bustos
        'R': 'relieves',
        'T': 'torsos-y-figuras',
        'TF': 'torsos-y-figuras',
        'F': 'torsos-y-figuras',    // Figuras
        'AD': 'arquitectura-y-diseno',
        'RD': 'torsos-y-figuras',   // Reducciones/Decorativos -> figuras
      };
      // Verificar prefijos de 2 caracteres primero, luego de 1
      const prefix2 = code.substring(0, 2).toUpperCase();
      const prefix1 = code.substring(0, 1).toUpperCase();
      categoryId = prefixMap[prefix2] || prefixMap[prefix1] || 'torsos-y-figuras'; // Default si no se encuentra
    }

    // Obtener valor de "Publicar" del Excel
    const publicarValue = row['Publicar'] || row['publicar'] || row['PUBLICAR'] || row['Publish'] || '';
    const isPublished = typeof publicarValue === 'boolean' 
      ? publicarValue 
      : ['true', 'si', 'sí', 'yes', '1', 'x', 'ok'].includes(String(publicarValue).toLowerCase().trim());

    // Preparar datos para actualizar
    const updateData = {};
    
    if (nombre) updateData.name = nombre.trim();
    if (autoria) updateData.artist = autoria.trim();
    if (dimensiones) updateData.dimensions = dimensiones.trim();
    if (pvp) updateData.price = normalizePrice(pvp);
    if (descripcion) updateData.description = descripcion.trim();
    if (categoryId) updateData.category_id = categoryId;
    
    // Guardar el estado de publicación
    updateData.published = isPublished;

    // Si no hay datos para actualizar, saltar
    if (Object.keys(updateData).length === 0) {
      console.log(`⚠️ ${code}: Sin datos para actualizar, saltando...`);
      skipped++;
      continue;
    }

    try {
      // Primero verificar si el producto existe
      const { data: existing, error: fetchError } = await supabase
        .from('products')
        .select('code, name')
        .eq('code', code)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, otros errores son problemas reales
        throw fetchError;
      }

      if (existing) {
        // Actualizar producto existente
        const { error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('code', code);

        if (updateError) throw updateError;

        console.log(`✅ ${code}: Actualizado - ${nombre || existing.name}`);
        updated++;
      } else {
        // El producto no existe, crear nuevo
        const newProduct = {
          code: code,
          ...updateData,
        };

        const { error: insertError } = await supabase
          .from('products')
          .insert(newProduct);

        if (insertError) throw insertError;

        console.log(`🆕 ${code}: Creado - ${nombre}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ ${code}: Error - ${error.message}`);
      errors++;
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`🆕 Creados: ${created}`);
  console.log(`⚠️ Saltados: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📦 Total procesados: ${data.length}`);
  console.log('='.repeat(60));
}

// Ejecutar
importProducts().catch(console.error);
