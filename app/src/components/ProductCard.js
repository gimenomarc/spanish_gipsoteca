import { Link } from "react-router-dom";
import { useState } from "react";
import OptimizedImage from "./OptimizedImage";

export default function ProductCard({ product, categoryId, index = 0 }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Obtener la imagen actual
  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : null;

  // Si no hay imágenes, no mostrar el producto
  if (!product.images || product.images.length === 0) {
    return null;
  }

  // Solo las primeras 4 imágenes se cargan con prioridad (above the fold)
  // Reducido de 8 a 4 para mejorar el rendimiento inicial
  const isPriority = index < 4;

  const handleImageError = () => {
    // Intentar con la siguiente imagen si hay más disponibles
    if (currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Si no hay más imágenes, marcar como error
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
          <OptimizedImage
            src={currentImage}
            alt={product.name}
            className="transition-transform duration-300 group-hover:scale-105"
            priority={isPriority}
            aspectRatio="3/4"
            onError={handleImageError}
          />
        </div>
        <div className="text-center">
          <p className="mb-1 text-sm font-body text-white sm:text-base">
            {product.name}, {product.artist}
          </p>
          <p className="mt-1 text-sm text-white/80">
            {product.price}
            <span className="text-xs text-white/50 ml-1">(+ gastos de envío)</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
