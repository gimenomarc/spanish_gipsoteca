import { useState, useRef, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

/**
 * Componente de imagen con zoom hover
 * Muestra una lupa/ventana de zoom que sigue el cursor cuando se pasa sobre la imagen
 */
export default function ImageZoom({ 
  src, 
  alt, 
  className = '',
  zoomScale = 3, // Factor de zoom (3x por defecto)
  zoomSize = 250, // Tamaño de la lupa en píxeles
  ...props 
}) {
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  // Extraer URL original sin optimización para el zoom
  const getOriginalUrl = (url) => {
    if (!url) return url;
    // Remover parámetros de optimización de Supabase para obtener imagen original
    if (url.includes('?')) {
      return url.split('?')[0];
    }
    return url;
  };

  const originalSrc = getOriginalUrl(src);

  // Precargar imagen original para el zoom
  useEffect(() => {
    if (originalSrc) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = originalSrc;
    }
  }, [originalSrc]);

  const handleMouseEnter = () => {
    if (imageLoaded) {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    // Posición del mouse relativa al contenedor (en píxeles)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Porcentaje de posición (0-1) limitado a los bordes
    const percentX = Math.max(0, Math.min(1, mouseX / rect.width));
    const percentY = Math.max(0, Math.min(1, mouseY / rect.height));
    
    // Calcular el tamaño de la imagen ampliada
    const zoomedWidth = rect.width * zoomScale;
    const zoomedHeight = rect.height * zoomScale;
    
    // Calcular la posición del background para centrar el área bajo el cursor
    // El área visible en la lupa es zoomSize x zoomSize
    // Queremos que el centro de la lupa muestre el área bajo el cursor
    const bgX = (percentX * zoomedWidth) - (zoomSize / 2);
    const bgY = (percentY * zoomedHeight) - (zoomSize / 2);
    
    setZoomPosition({ 
      x: e.clientX,
      y: e.clientY,
      bgX: -bgX,
      bgY: -bgY,
      zoomedWidth,
      zoomedHeight
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ cursor: imageLoaded ? 'zoom-in' : 'default' }}
    >
      {/* Imagen principal optimizada */}
      <div className="w-full h-full">
        <OptimizedImage
          src={src}
          alt={alt}
          className="h-full w-full"
          priority={true}
          aspectRatio="3/4"
          size="detail"
          {...props}
        />
      </div>

      {/* Lupa de zoom - ventana flotante que sigue al cursor */}
      {isZooming && imageLoaded && (
        <div
          className="fixed pointer-events-none z-[100] overflow-hidden"
          style={{
            width: `${zoomSize}px`,
            height: `${zoomSize}px`,
            left: `${zoomPosition.x + 20}px`, // Offset a la derecha del cursor
            top: `${zoomPosition.y - zoomSize / 2}px`, // Centrado verticalmente
            borderRadius: '12px',
            border: '3px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0,0,0,0.3)',
            backgroundColor: '#000',
          }}
        >
          {/* Imagen ampliada dentro de la lupa */}
          <img
            src={originalSrc}
            alt={`${alt} - zoom`}
            style={{
              width: `${zoomPosition.zoomedWidth}px`,
              height: `${zoomPosition.zoomedHeight}px`,
              maxWidth: 'none',
              transform: `translate(${zoomPosition.bgX}px, ${zoomPosition.bgY}px)`,
              objectFit: 'cover',
            }}
            draggable={false}
          />
        </div>
      )}

      {/* Indicador de carga del zoom */}
      {!imageLoaded && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Cargando zoom...
        </div>
      )}
    </div>
  );
}
