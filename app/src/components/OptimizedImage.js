import { useState, useEffect, useRef } from 'react';
import { cdnUrl, imagePresets, srcSetPresets, sizesPresets } from '../utils/imageOptimizer';

export default function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  aspectRatio = '3/4',
  size = 'card',
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [usedFallback, setUsedFallback] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const preloadLinkRef = useRef(null);

  const optimizedSrc = src ? (
    typeof size === 'string' && imagePresets[size]
      ? imagePresets[size](src)
      : typeof size === 'object'
        ? cdnUrl(src, size)
        : cdnUrl(src)
  ) : src;

  // Fallback: si optimizedSrc falla (ej: _thumb.webp no existe), usar la URL original con solo encode de espacios
  const fallbackSrc = src ? cdnUrl(src) : src;
  const currentSrc = usedFallback ? fallbackSrc : optimizedSrc;

  const srcSet = src && typeof size === 'string' && srcSetPresets[size]
    ? srcSetPresets[size](src)
    : null;
  const sizes = typeof size === 'string' && sizesPresets[size]
    ? sizesPresets[size]
    : undefined;

  // Preloading solo para imágenes con prioridad alta (eliminado preload duplicado)
  useEffect(() => {
    if (priority && currentSrc && !preloadLinkRef.current) {
      const preloadImg = new Image();
      preloadImg.src = currentSrc;
      preloadImg.fetchPriority = 'high';
      preloadLinkRef.current = preloadImg;
    }

    return () => {
      preloadLinkRef.current = null;
    };
  }, [priority, currentSrc]);

  // Intersection Observer para lazy loading inteligente
  useEffect(() => {
    // Si es prioridad alta, cargar inmediatamente
    if (priority) {
      setShouldLoad(true);
      return;
    }

    // Capturar el elemento actual una sola vez para evitar acceder a imgRef.current en la limpieza
    const imgElement = imgRef.current;

    // Pequeño delay para asegurar que el elemento esté en el DOM
    const timeoutId = setTimeout(() => {
      // Verificar que el elemento existe
      if (!imgElement) {
        return;
      }

      // Verificar si el elemento ya está en el viewport (para elementos que ya son visibles)
      const rect = imgElement.getBoundingClientRect();
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
              if (observerRef.current && imgElement) {
                observerRef.current.unobserve(imgElement);
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
      observerRef.current.observe(imgElement);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current && imgElement) {
        observerRef.current.unobserve(imgElement);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    // Si el optimizedSrc falla y aún no hemos probado el fallback, intentarlo
    if (!usedFallback && fallbackSrc && fallbackSrc !== optimizedSrc) {
      setUsedFallback(true);
      setIsLoading(true);
      return;
    }
    // Si el fallback también falla, mostrar error
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
          src={currentSrc}
          srcSet={usedFallback ? undefined : (srcSet || undefined)}
          sizes={sizes || undefined}
          alt={alt}
          className={`h-full w-full transition-opacity duration-300 ${
            objectFit === 'contain' ? 'object-contain' : 'object-cover'
          } ${hasError ? 'hidden' : ''} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ objectPosition }}
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
