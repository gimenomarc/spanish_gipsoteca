/**
 * Utilidad para optimizar URLs de imágenes de Supabase Storage
 * usando las transformaciones nativas de Supabase
 */

/**
 * Optimiza una URL de imagen de Supabase con transformaciones nativas.
 * Cambia el endpoint de 'object/public' a 'render/image/public' para activar la optimización.
 * @param {string} url - URL original de Supabase Storage
 * @param {Object} options - Opciones de optimización
 * @param {number} options.width - Ancho máximo en píxeles
 * @param {number} options.height - Alto máximo en píxeles
 * @param {number} options.quality - Calidad de compresión (1-100, default: 80)
 * @param {string} options.format - Formato de salida: 'webp', 'avif', 'auto' (default: 'webp')
 * @returns {string} URL optimizada
 */
export function optimizeImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Si la URL no es de Supabase Storage, retornar sin cambios
  if (!url.includes('supabase.co') || !url.includes('storage/v1/object/public/')) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
  } = options;

  // Construir la URL de renderizado de Supabase
  // Formato: https://[project-id].supabase.co/storage/v1/render/image/public/[bucket]/[path]
  const renderUrl = url.replace('storage/v1/object/public/', 'storage/v1/render/image/public/');

  // Construir parámetros de transformación
  const params = new URLSearchParams();

  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  if (quality) params.append('quality', quality.toString());
  if (format) params.append('format', format);

  // Por defecto, todas las imágenes se sirven como cover si hay redimensión
  if (width || height) {
    params.append('resize', 'cover');
  }

  return `${renderUrl}?${params.toString()}`;
}

/**
 * Genera múltiples tamaños de una imagen para srcset responsivo
 */
export function generateSrcSet(url, sizes = [400, 600, 800, 1200], quality = 80, format = 'webp') {
  if (!url || typeof url !== 'string' || !url.includes('supabase.co')) {
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
 */
export function generateSrcSetString(url, sizes = [400, 600, 800, 1200], quality = 80, format = 'webp') {
  const srcSet = generateSrcSet(url, sizes, quality, format);
  if (srcSet.length === 0) return '';
  return srcSet.map(({ url, descriptor }) => `${url} ${descriptor}`).join(', ');
}

/**
 * Presets de optimización para diferentes contextos
 * Ahora usa transformaciones en tiempo real de Supabase
 */
export const imagePresets = {
  // Thumbnail pequeño (para carrito, listas) - 150px
  thumbnail: (url) => optimizeImageUrl(url, { width: 150, quality: 75, format: 'webp' }),

  // Tarjeta de producto (grid de productos) - 600px
  card: (url) => optimizeImageUrl(url, { width: 600, quality: 80, format: 'webp' }),

  // Imagen principal de detalle (página de producto) - 1200px
  detail: (url) => optimizeImageUrl(url, { width: 1200, quality: 85, format: 'webp' }),

  // Imagen grande (full size) - 1920px
  full: (url) => optimizeImageUrl(url, { width: 1920, quality: 85, format: 'webp' }),

  // Thumbnail de galería - 300px
  galleryThumb: (url) => optimizeImageUrl(url, { width: 300, quality: 75, format: 'webp' }),

  // === SG GALLERY PRESETS ===

  // Portada de colección en Home (800px, calidad alta)
  sgCollectionCover: (url) => optimizeImageUrl(url, { width: 800, quality: 85, format: 'webp' }),

  // Foto en grid de colección (600px, calidad media-alta)
  sgPhotoGrid: (url) => optimizeImageUrl(url, { width: 600, quality: 80, format: 'webp' }),

  // Card de foto (para secciones relacionadas) - 400px
  sgPhotoCard: (url) => optimizeImageUrl(url, { width: 400, quality: 80, format: 'webp' }),

  // Foto en modal/detalle (1400px, calidad alta)
  sgPhotoDetail: (url) => optimizeImageUrl(url, { width: 1400, quality: 90, format: 'webp' }),

  // Portada hero full-screen (1920px, calidad alta)
  sgCollectionHero: (url) => optimizeImageUrl(url, { width: 1920, quality: 85, format: 'webp' }),
};

/**
 * Presets de srcset para diferentes contextos
 */
export const srcSetPresets = {
  thumbnail: (url) => generateSrcSetString(url, [150, 300]),
  card: (url) => generateSrcSetString(url, [400, 600, 800]),
  detail: (url) => generateSrcSetString(url, [600, 800, 1200, 1600]),
  galleryThumb: (url) => generateSrcSetString(url, [300, 600]),
  full: (url) => generateSrcSetString(url, [800, 1200, 1920, 2560]),
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
