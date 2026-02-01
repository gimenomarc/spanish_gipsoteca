import { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, imagePresets, srcSetPresets, sizesPresets } from '../utils/imageOptimizer';

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

  // Preloading solo para imágenes con prioridad alta (eliminado preload duplicado)
  useEffect(() => {
    if (priority && optimizedSrc && !preloadLinkRef.current) {
      // Solo usar Image() para preload, más eficiente que link + Image
      // El navegador maneja mejor la prioridad con fetchPriority
      const preloadImg = new Image();
      preloadImg.src = optimizedSrc;
      preloadImg.fetchPriority = 'high';
      
      // Guardar referencia para limpieza si es necesario
      preloadLinkRef.current = preloadImg;
    }

    return () => {
      preloadLinkRef.current = null;
    };
  }, [priority, optimizedSrc]);

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
        rect.top < window.innerHeight + 200 && // Reducido a 200px
        rect.bottom > -200 &&
        rect.left < window.innerWidth + 200 &&
        rect.right > -200;

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
          // Reducido a 200px para cargar solo imágenes cercanas al viewport
          // Esto reduce la carga simultánea y mejora el rendimiento
          rootMargin: '200px',
          threshold: 0.01,
        }
      );

      // Observar el contenedor
      observerRef.current.observe(imgRef.current);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      const currentImg = imgRef.current;
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
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
