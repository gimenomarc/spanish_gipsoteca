/**
 * Script para dar formato profesional al Excel de productos
 * 
 * Uso: node scripts/format-excel.js
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ruta al archivo Excel
const EXCEL_PATH = path.join(__dirname, '..', 'public', 'data', 'Productos_Enero.xlsx');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'Productos_Enero_FORMATEADO.xlsx');

async function formatExcel() {
  console.log('🎨 Formateando Excel de productos...\n');

  // Verificar que el archivo existe
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ Error: No se encontró el archivo Excel en: ${EXCEL_PATH}`);
    process.exit(1);
  }

  // Leer el archivo Excel
  console.log('📂 Leyendo archivo Excel...');
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Obtener datos como array
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  // Encontrar la fila de encabezados
  let headerRowIndex = -1;
  let headers = [];
  
  for (let i = 0; i < Math.min(rawData.length, 10); i++) {
    const row = rawData[i];
    const rowStr = row.join(' ').toLowerCase();
    if (rowStr.includes('nombre') || rowStr.includes('pieza') || rowStr.includes('tipolog')) {
      headerRowIndex = i;
      headers = row.filter(h => h && String(h).trim() !== '');
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.error('❌ No se encontraron los encabezados');
    process.exit(1);
  }

  console.log(`📋 Encabezados encontrados en fila ${headerRowIndex + 1}`);
  console.log(`   Columnas: ${headers.length}\n`);

  // Extraer solo los datos válidos (desde los encabezados hasta el final de datos)
  const cleanData = [];
  
  // Añadir encabezados limpios
  const cleanHeaders = [
    'Código',
    'Nombre',
    'Tipología', 
    'Fecha',
    'Autoría',
    'Dimensiones',
    'PVP',
    'Catálogo',
    'Descripción',
    'Publicar'
  ];
  cleanData.push(cleanHeaders);

  // Añadir filas de datos
  let dataRowCount = 0;
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    
    // Verificar si la fila tiene datos
    const hasData = row.some(cell => cell && String(cell).trim() !== '');
    if (!hasData) continue;
    
    // Extraer valores (ajustando índices según la estructura del Excel original)
    // El Excel original tiene datos empezando en columna B (índice 1)
    const cleanRow = [
      String(row[1] || '').trim(),  // Código (Columna1)
      String(row[2] || '').trim(),  // Nombre
      String(row[3] || '').trim(),  // Tipología
      String(row[4] || '').trim(),  // Fecha
      String(row[5] || '').trim(),  // Autoría
      String(row[6] || '').trim(),  // Dimensiones
      String(row[7] || '').trim(),  // PVP
      String(row[8] || '').trim(),  // Catálogo
      String(row[9] || '').trim(),  // Descripción
      String(row[10] || 'SI').trim().toUpperCase() || 'SI',  // Publicar
    ];
    
    // Solo añadir si tiene código
    if (cleanRow[0]) {
      cleanData.push(cleanRow);
      dataRowCount++;
    }
  }

  console.log(`📦 Productos encontrados: ${dataRowCount}\n`);

  // Crear nuevo workbook con formato
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.aoa_to_sheet(cleanData);

  // Configurar anchos de columna
  newWorksheet['!cols'] = [
    { wch: 10 },   // Código
    { wch: 45 },   // Nombre
    { wch: 15 },   // Tipología
    { wch: 18 },   // Fecha
    { wch: 30 },   // Autoría
    { wch: 25 },   // Dimensiones
    { wch: 15 },   // PVP
    { wch: 18 },   // Catálogo
    { wch: 80 },   // Descripción
    { wch: 10 },   // Publicar
  ];

  // Congelar primera fila (encabezados)
  newWorksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Añadir filtros automáticos
  const range = XLSX.utils.decode_range(newWorksheet['!ref']);
  newWorksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

  // Añadir la hoja al workbook
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Productos');

  // Guardar el archivo formateado
  console.log('💾 Guardando archivo formateado...');
  XLSX.writeFile(newWorkbook, OUTPUT_PATH);
  
  // También sobrescribir el original
  XLSX.writeFile(newWorkbook, EXCEL_PATH);
  
  console.log(`   ✅ Guardado: ${OUTPUT_PATH}`);
  console.log(`   ✅ Original actualizado: ${EXCEL_PATH}\n`);

  // Resumen
  console.log('='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Excel formateado correctamente`);
  console.log(`✅ ${dataRowCount} productos`);
  console.log(`✅ ${cleanHeaders.length} columnas`);
  console.log('');
  console.log('📋 COLUMNAS:');
  cleanHeaders.forEach((h, i) => console.log(`   ${i + 1}. ${h}`));
  console.log('');
  console.log('✨ FORMATO APLICADO:');
  console.log('   • Datos empezando en fila 1');
  console.log('   • Anchos de columna optimizados');
  console.log('   • Filtros automáticos activados');
  console.log('   • Columna "Publicar" con valores SI/NO');
  console.log('='.repeat(60));
}

formatExcel().catch(console.error);
