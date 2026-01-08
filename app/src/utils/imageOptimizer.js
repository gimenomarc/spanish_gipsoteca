/**
 * Utilidad para optimizar URLs de imágenes de Supabase Storage
 * usando las transformaciones nativas de Supabase
 */

/**
 * Optimiza una URL de imagen de Supabase con transformaciones
 * @param {string} url - URL original de Supabase Storage
 * @param {Object} options - Opciones de optimización
 * @param {number} options.width - Ancho máximo en píxeles
 * @param {number} options.height - Alto máximo en píxeles
 * @param {number} options.quality - Calidad de compresión (1-100, default: 80)
 * @param {string} options.format - Formato de salida: 'webp', 'avif', 'auto' (default: 'webp')
 * @param {boolean} options.resize - Si debe redimensionar (default: true)
 * @returns {string} URL optimizada
 */
export function optimizeImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Si la URL no es de Supabase Storage, retornar sin cambios
  if (!url.includes('supabase.co') && !url.includes('storage')) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = true,
  } = options;

  // Construir parámetros de transformación
  const params = new URLSearchParams();

  if (width) {
    params.append('width', width.toString());
  }

  if (height) {
    params.append('height', height.toString());
  }

  if (resize && (width || height)) {
    params.append('resize', 'cover'); // cover, contain, fill
  }

  if (quality && quality !== 100) {
    params.append('quality', quality.toString());
  }

  if (format && format !== 'auto') {
    params.append('format', format);
  }

  // Si hay parámetros, agregarlos a la URL
  if (params.toString()) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  return url;
}

/**
 * Genera múltiples tamaños de una imagen para srcset responsivo
 * @param {string} url - URL original de la imagen
 * @param {Object} sizes - Objeto con diferentes tamaños { width: height }
 * @param {number} quality - Calidad de compresión (default: 80)
 * @param {string} format - Formato de salida (default: 'webp')
 * @returns {Array} Array de objetos { url, width, descriptor }
 */
export function generateSrcSet(url, sizes = [400, 600, 800, 1200], quality = 80, format = 'webp') {
  if (!url || typeof url !== 'string') {
    return [];
  }

  return sizes.map(width => ({
    url: optimizeImageUrl(url, { width, quality, format }),
    width,
    descriptor: `${width}w`
  }));
}

/**
 * Genera srcset string para usar en el atributo srcset de img
 * @param {string} url - URL original de la imagen
 * @param {Array} sizes - Array de anchos en píxeles
 * @param {number} quality - Calidad de compresión
 * @param {string} format - Formato de salida
 * @returns {string} String srcset
 */
export function generateSrcSetString(url, sizes = [400, 600, 800, 1200], quality = 80, format = 'webp') {
  const srcSet = generateSrcSet(url, sizes, quality, format);
  return srcSet.map(({ url, descriptor }) => `${url} ${descriptor}`).join(', ');
}

/**
 * Presets de optimización para diferentes contextos
 */
export const imagePresets = {
  // Thumbnail pequeño (para carrito, listas)
  thumbnail: (url) => optimizeImageUrl(url, {
    width: 100,
    height: 133, // 3:4 aspect ratio
    quality: 70,
    format: 'webp',
  }),

  // Tarjeta de producto (grid de productos) - con srcset
  card: (url) => optimizeImageUrl(url, {
    width: 600,
    height: 800, // 3:4 aspect ratio
    quality: 75,
    format: 'webp',
  }),

  // Imagen principal de detalle (página de producto) - con srcset
  detail: (url) => optimizeImageUrl(url, {
    width: 1200,
    height: 1600, // 3:4 aspect ratio
    quality: 85,
    format: 'webp',
  }),

  // Imagen grande (full size, pero optimizada)
  full: (url) => optimizeImageUrl(url, {
    width: 1920,
    quality: 90,
    format: 'webp',
  }),

  // Thumbnail de galería
  galleryThumb: (url) => optimizeImageUrl(url, {
    width: 200,
    height: 267, // 3:4 aspect ratio
    quality: 70,
    format: 'webp',
  }),
};

/**
 * Presets de srcset para diferentes contextos
 */
export const srcSetPresets = {
  // Thumbnail pequeño
  thumbnail: (url) => generateSrcSetString(url, [100, 150, 200], 70, 'webp'),
  
  // Tarjeta de producto (grid) - responsivo
  card: (url) => generateSrcSetString(url, [300, 400, 600, 800], 75, 'webp'),
  
  // Imagen de detalle - responsivo
  detail: (url) => generateSrcSetString(url, [600, 800, 1000, 1200, 1600], 85, 'webp'),
  
  // Thumbnail de galería
  galleryThumb: (url) => generateSrcSetString(url, [150, 200, 250], 70, 'webp'),
  
  // Full size
  full: (url) => generateSrcSetString(url, [800, 1200, 1600, 1920], 90, 'webp'),
};

/**
 * Genera sizes string para el atributo sizes de img
 */
export const sizesPresets = {
  thumbnail: '100px',
  card: '(max-width: 640px) 300px, (max-width: 1024px) 400px, 600px',
  detail: '(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px',
  galleryThumb: '200px',
  full: '100vw',
};

/**
 * Optimiza un array de URLs de imágenes
 * @param {string[]} urls - Array de URLs
 * @param {Function} preset - Función preset o opciones personalizadas
 * @returns {string[]} Array de URLs optimizadas
 */
export function optimizeImageUrls(urls, preset = imagePresets.card) {
  if (!Array.isArray(urls)) {
    return urls;
  }

  return urls.map(url => {
    if (typeof preset === 'function') {
      return preset(url);
    }
    return optimizeImageUrl(url, preset);
  });
}
