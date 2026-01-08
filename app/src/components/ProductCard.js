import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProductCard({ product, categoryId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Obtener la imagen actual
  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : null;

  // Si no hay imágenes, no mostrar el producto
  if (!product.images || product.images.length === 0) {
    return null;
  }

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    // Intentar con la siguiente imagen si hay más disponibles
    if (currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setIsLoading(true);
    } else {
      // Si no hay más imágenes, marcar como error
      setIsLoading(false);
      setHasError(true);
    }
  };

  if (hasError) {
    // No mostrar el producto si no tiene imagen válida
    return null;
  }

  return (
    <Link
      to={`/product/${categoryId}/${product.code}`}
      className="group block cursor-pointer"
    >
      <article className="group">
        <div className="mb-4 aspect-[3/4] overflow-hidden bg-black relative">
          {/* Placeholder mientras carga */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-pulse">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
          {/* Imagen */}
          <img
            src={currentImage}
            alt={product.name}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="text-center">
          <p className="mb-1 text-sm font-body italic text-white sm:text-base">
            {product.name}, {product.artist}
          </p>
          <p className="text-xs text-white/70 sm:text-sm">Code {product.code}</p>
          <p className="mt-1 text-base font-medium text-white sm:text-lg">{product.price}</p>
        </div>
      </article>
    </Link>
  );
}
