// Estructura de productos basada en las carpetas de Google Drive
// Este archivo se actualiza cuando descargas las imágenes

export const categories = {
  "mascaras-y-bustos": {
    id: "mascaras-y-bustos",
    name: "Máscaras y Bustos",
    nameEn: "Masks & Busts",
    products: [
      {
        code: "CB001",
        name: "Angel Borromini",
        folder: "CB001 - Angel Borromini",
        // Las imágenes se cargarán desde: /images/categorias/mascaras-y-bustos/CB001 - Angel Borromini/
        price: "450€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Escultura clásica de busto representando a Angel Borromini.",
      },
      {
        code: "CB002",
        name: "Cabeza niño pajaro",
        folder: "CB002 - Cabeza niño pajaro",
        price: "450€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Busto clásico de niño con representación de pájaro.",
      },
      {
        code: "CB004",
        name: "Busto de niño",
        folder: "CB004 - Busto de niño",
        price: "450€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Busto clásico de niño.",
      },
      {
        code: "CB005",
        name: "Busto Claudio",
        folder: "CB005 - Busto Claudio",
        price: "450€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Busto de Claudio.",
      },
      {
        code: "M001",
        name: "Madonna Pietá",
        folder: "M001 - Madonna Pietá",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Máscara de la Madonna Pietá.",
      },
      {
        code: "M002",
        name: "Esclavo moribundo",
        folder: "M002 - Esclavo moribundo",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Máscara del Esclavo moribundo.",
      },
      {
        code: "M004",
        name: "David Mascara Grande",
        folder: "M004 - David Mascara Grande",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Máscara grande de David.",
      },
      {
        code: "M005",
        name: "Extasis Santa Teresa",
        folder: "M005 - Extasis Santa Teresa",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Máscara del Éxtasis de Santa Teresa.",
      },
      {
        code: "M006",
        name: "Guidarello Guidarelli",
        folder: "M006 - Guidarello Guidarelli",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Busto de Guidarello Guidarelli.",
      },
      {
        code: "M007",
        name: "Homero",
        folder: "M007 - Homero",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Busto de Homero.",
      },
      {
        code: "M008",
        name: "Apollo Belvedere",
        folder: "M008 - Apollo Belvedere",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Busto de Apollo Belvedere.",
      },
      {
        code: "M009",
        name: "Bethoven",
        folder: "M009 - Bethoven",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Busto de Beethoven.",
      },
      {
        code: "M010",
        name: "Retrato clasico",
        folder: "M010 - Retrato clasico",
        price: "460€",
        artist: "Unknown artist",
        dimensions: "90X24X27cm",
        description: "Retrato clásico.",
      },
    ],
  },
  "relieves": {
    id: "relieves",
    name: "Relieves",
    nameEn: "Reliefs",
    products: [],
  },
  "figuras-anatomicas": {
    id: "figuras-anatomicas",
    name: "Figuras Anatómicas",
    nameEn: "Anatomical Figures",
    products: [],
  },
  "torsos-y-figuras": {
    id: "torsos-y-figuras",
    name: "Torsos y Figuras",
    nameEn: "Torsos & Figures",
    products: [],
  },
  "arquitectura-y-diseno": {
    id: "arquitectura-y-diseno",
    name: "Arquitectura y Diseño",
    nameEn: "Design & Architecture",
    products: [],
  },
  "actualizacion-enero-2026": {
    id: "actualizacion-enero-2026",
    name: "Actualización Enero 2026",
    nameEn: "January 2026 Update",
    products: [],
  },
};

// Función helper para obtener la ruta de imagen de un producto
export function getProductImagePath(categoryId, productFolder, imageName) {
  return `/images/categorias/${categoryId}/${productFolder}/${imageName}`;
}

// Función helper para obtener todas las imágenes de un producto
// Nota: En producción, esto podría requerir un endpoint del servidor
// o un archivo de índice generado automáticamente
export function getProductImages(categoryId, productFolder) {
  // Esta función se puede mejorar cuando tengas las imágenes descargadas
  // Por ahora retorna un array vacío que se puede poblar manualmente
  return [];
}

// Función para obtener todos los productos de todas las categorías
export function getAllProducts() {
  return Object.values(categories).flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryId: category.id,
      categoryName: category.name,
    }))
  );
}

// Función para buscar productos por código
export function getProductByCode(code) {
  const allProducts = getAllProducts();
  return allProducts.find((p) => p.code === code);
}

