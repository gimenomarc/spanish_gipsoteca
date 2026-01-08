import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para preload agresivo de imágenes
 * @param {string|string[]} images - URL(s) de imagen(es) a preloadar
 * @param {Object} options - Opciones de preload
 * @param {boolean} options.priority - Si es true, usa fetchPriority='high'
 * @param {number} options.maxImages - Máximo número de imágenes a preloadar
 */
export function useImagePreload(images, options = {}) {
  const { priority = false, maxImages = 1 } = options;
  const preloadRefs = useRef([]);

  useEffect(() => {
    if (!images) return;

    const imageUrls = Array.isArray(images) ? images.slice(0, maxImages) : [images];
    const links = [];
    const imgs = [];

    imageUrls.forEach((url) => {
      if (!url) return;

      // Preload con <link>
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.fetchPriority = priority ? 'high' : 'low';
      document.head.appendChild(link);
      links.push(link);

      // Preload con Image() para mejor compatibilidad
      const img = new Image();
      img.src = url;
      img.fetchPriority = priority ? 'high' : 'low';
      imgs.push(img);
    });

    preloadRefs.current = [...links, ...imgs];

    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [images, priority, maxImages]);

  return preloadRefs.current;
}
