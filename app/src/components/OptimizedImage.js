import { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, imagePresets, srcSetPresets, sizesPresets } from '../utils/imageOptimizer';
import { imageCache } from '../utils/imageCache';

/**
 * Componente de imagen optimizada con:
 * - Lazy loading inteligente con Intersection Observer
 * - srcset responsivo para múltiples tamaños
 * - Preloading agresivo de imágenes críticas
 * - Placeholder blur mejorado
 * - Priorización de carga
 * - Manejo de errores robusto
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false, // Si es true, carga inmediatamente con alta prioridad
  aspectRatio = '3/4', // Aspect ratio para el placeholder
  size = 'card', // 'thumbnail', 'card', 'detail', 'full', 'galleryThumb'
  onLoad,
  onError,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority); // Si priority=true, carga inmediatamente
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const preloadLinkRef = useRef(null);

  // Optimizar URL según el tamaño solicitado
  const optimizedSrc = src ? (
    typeof size === 'string' && imagePresets[size]
      ? imagePresets[size](src)
      : optimizeImageUrl(src, typeof size === 'object' ? size : {})
  ) : src;

  // Generar srcset y sizes para imágenes responsivas
  const srcSet = src && typeof size === 'string' && srcSetPresets[size]
    ? srcSetPresets[size](src)
    : null;
  const sizes = typeof size === 'string' && sizesPresets[size]
    ? sizesPresets[size]
    : undefined;

  // Preloading agresivo para imágenes con prioridad
  useEffect(() => {
    if (priority && optimizedSrc && !preloadLinkRef.current) {
      // Usar caché de imágenes para precargar
      imageCache.preload(optimizedSrc).catch(() => {
        // Silenciar errores de precarga
      });

      // Crear link de preload para la imagen principal
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      link.fetchPriority = 'high';
      
      // Si hay srcset, también preloadar la imagen principal
      if (srcSet) {
        // Extraer la URL más grande del srcset para preload
        const srcSetUrls = srcSet.split(', ');
        if (srcSetUrls.length > 0) {
          const largestUrl = srcSetUrls[srcSetUrls.length - 1].split(' ')[0];
          link.href = largestUrl;
          imageCache.preload(largestUrl).catch(() => {});
        }
      }
      
      document.head.appendChild(link);
      preloadLinkRef.current = link;

      // También preloadar usando Image() para mejor compatibilidad
      const preloadImg = new Image();
      preloadImg.src = optimizedSrc;
      preloadImg.fetchPriority = 'high';
    }

    return () => {
      if (preloadLinkRef.current && document.head.contains(preloadLinkRef.current)) {
        document.head.removeChild(preloadLinkRef.current);
        preloadLinkRef.current = null;
      }
    };
  }, [priority, optimizedSrc, srcSet]);

  // Intersection Observer para lazy loading inteligente
  useEffect(() => {
    // Si es prioridad alta, cargar inmediatamente
    if (priority) {
      setShouldLoad(true);
      return;
    }

    // Pequeño delay para asegurar que el elemento esté en el DOM
    const timeoutId = setTimeout(() => {
      // Verificar que el elemento existe
      if (!imgRef.current) {
        return;
      }

      // Verificar si el elemento ya está en el viewport (para elementos que ya son visibles)
      const rect = imgRef.current.getBoundingClientRect();
      const isInViewport = 
        rect.top < window.innerHeight + 400 && // Aumentado a 400px para cargar antes
        rect.bottom > -400 &&
        rect.left < window.innerWidth + 400 &&
        rect.right > -400;

      if (isInViewport) {
        setShouldLoad(true);
        return;
      }

      // Crear observer para cargar cuando esté cerca del viewport
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              // Desconectar después de activar
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current);
              }
            }
          });
        },
        {
          // Cargar cuando esté a 400px del viewport (aumentado para mejor UX)
          rootMargin: '400px',
          threshold: 0.01,
        }
      );

      // Observar el contenedor
      observerRef.current.observe(imgRef.current);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  return (
    <div
      ref={imgRef}
      className={`relative h-full w-full overflow-hidden bg-black ${className}`}
    >
      {/* Placeholder mientras carga o antes de que shouldLoad sea true */}
      {(!shouldLoad || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/80 via-black/60 to-black/80 animate-pulse">
          <div className="text-center">
            <svg
              className="mx-auto h-8 w-8 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Imagen */}
      {shouldLoad && (
        <img
          src={optimizedSrc}
          srcSet={srcSet || undefined}
          sizes={sizes || undefined}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${hasError ? 'hidden' : ''}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <svg
              className="mx-auto h-8 w-8 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-xs text-white/50">Imagen no disponible</p>
          </div>
        </div>
      )}
    </div>
  );
}
