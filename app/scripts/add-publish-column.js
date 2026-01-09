/**
 * Script para añadir la columna "Publicar" al Excel de productos
 * 
 * Uso: node scripts/add-publish-column.js
 * 
 * Este script:
 * 1. Lee el Excel existente
 * 2. Añade una columna "Publicar" con valor "SI" por defecto
 * 3. Guarda el archivo actualizado
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ruta al archivo Excel
const EXCEL_PATH = path.join(__dirname, '..', 'public', 'data', 'Productos_Enero.xlsx');
const BACKUP_PATH = path.join(__dirname, '..', 'public', 'data', 'Productos_Enero_BACKUP.xlsx');

async function addPublishColumn() {
  console.log('📝 Añadiendo columna "Publicar" al Excel...\n');

  // Verificar que el archivo existe
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ Error: No se encontró el archivo Excel en: ${EXCEL_PATH}`);
    process.exit(1);
  }

  // Crear backup del archivo original
  console.log('💾 Creando backup del archivo original...');
  fs.copyFileSync(EXCEL_PATH, BACKUP_PATH);
  console.log(`   ✅ Backup guardado en: ${BACKUP_PATH}\n`);

  // Leer el archivo Excel
  console.log('📂 Leyendo archivo Excel...');
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Obtener el rango actual
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  console.log(`   Rango actual: ${worksheet['!ref']}`);
  console.log(`   Filas: ${range.e.r + 1}, Columnas: ${range.e.c + 1}\n`);

  // Encontrar la fila de encabezados
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  let headerRowIndex = -1;
  
  for (let i = 0; i < Math.min(rawData.length, 10); i++) {
    const row = rawData[i];
    const rowStr = row.join(' ').toLowerCase();
    if (rowStr.includes('nombre') || rowStr.includes('pieza') || rowStr.includes('tipolog')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  console.log(`📋 Fila de encabezados: ${headerRowIndex + 1}`);

  // Nueva columna será la siguiente después de la última
  const newColIndex = range.e.c + 1;
  const newColLetter = XLSX.utils.encode_col(newColIndex);
  
  console.log(`➕ Añadiendo columna "${newColLetter}" (Publicar)\n`);

  // Añadir encabezado "Publicar"
  const headerCell = newColLetter + (headerRowIndex + 1);
  worksheet[headerCell] = { t: 's', v: 'Publicar' };
  console.log(`   ✅ Encabezado añadido en ${headerCell}`);

  // Añadir "SI" a todas las filas con datos
  let addedCount = 0;
  for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
    // Verificar si la fila tiene datos (chequeando columnas A, B, C)
    let hasData = false;
    for (const col of ['A', 'B', 'C']) {
      const cell = worksheet[col + (row + 1)];
      if (cell && cell.v && String(cell.v).trim() !== '') {
        hasData = true;
        break;
      }
    }
    
    if (hasData) {
      const cellAddress = newColLetter + (row + 1);
      worksheet[cellAddress] = { t: 's', v: 'SI' };
      addedCount++;
    }
  }
  
  console.log(`   ✅ Valor "SI" añadido a ${addedCount} filas\n`);

  // Actualizar el rango del worksheet
  range.e.c = newColIndex;
  worksheet['!ref'] = XLSX.utils.encode_range(range);

  // Guardar el archivo
  console.log('💾 Guardando archivo Excel actualizado...');
  XLSX.writeFile(workbook, EXCEL_PATH);
  console.log(`   ✅ Archivo guardado: ${EXCEL_PATH}\n`);

  // Resumen
  console.log('='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Columna "Publicar" añadida en columna ${newColLetter}`);
  console.log(`✅ ${addedCount} productos marcados con "SI"`);
  console.log(`💾 Backup guardado en: Productos_Enero_BACKUP.xlsx`);
  console.log('');
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('1. Abre el Excel: public/data/Productos_Enero.xlsx');
  console.log('2. Cambia "SI" a "NO" en los productos que NO quieres publicar');
  console.log('3. Ejecuta: node scripts/import-products-excel.js');
  console.log('='.repeat(60));
}

addPublishColumn().catch(console.error);
