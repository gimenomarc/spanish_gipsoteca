// Utilidad para cargar imágenes de productos automáticamente

// Lista de nombres comunes de archivos de imagen que se buscarán en orden
const commonImageNames = [
  'DSC04562 (1).jpg',
  'DSC04584.jpg',
  'DSC04551.jpg',
  'DSC04571.jpg',
  'DSC04378 (1).jpg',
  'DSC04503.jpg',
  'DSC03549.jpg',
  'DSC03561.jpg',
  'DSC03892.jpg',
  'DSC03506.jpg',
  'DSC03619.jpg',
  'DSC04408.jpg',
  'la buena.jpg',
  'DSC03985.jpg',
  'DSC04013.jpg',
  'DSC04005.jpg',
  'DSC03590.jpg',
  'DSC04427.jpg',
  'DSC04342.jpg',
  'DSC03675.jpg',
  'DSC04332.jpg',
  'DSC04350.jpg',
  'DSC03778 (1).jpg',
  'DSC03702.jpg',
  'DSC04114.jpg',
  // Añadir más nombres según se encuentren
];

// Función para obtener la primera imagen de un producto
export function getProductMainImage(categoryId, productFolder) {
  // Primero intenta con el código del producto (ej: CB001.jpg, M001.jpg)
  const productCode = productFolder.split(' - ')[0];
  const possibleNames = [
    `${productCode}.jpg`,
    `${productCode}.png`,
    ...commonImageNames,
  ];

  // Retorna la primera ruta que potencialmente existe
  // El componente manejará el error si no existe
  return `/images/categorias/${categoryId}/${productFolder}/${possibleNames[0]}`;
}

// Función para obtener todas las posibles imágenes de un producto
export function getProductImages(categoryId, productFolder) {
  const basePath = `/images/categorias/${categoryId}/${productFolder}/`;
  
  // Retorna un array de posibles rutas de imágenes
  // El componente intentará cargarlas y mostrará las que existan
  return [
    `${basePath}DSC04562 (1).jpg`,
    `${basePath}DSC04563.jpg`,
    `${basePath}DSC04564.jpg`,
    `${basePath}DSC04565.jpg`,
  ];
}

// Función para verificar si una imagen existe (del lado del cliente)
export function checkImageExists(imagePath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
}

