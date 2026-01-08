import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProductCard({ product, categoryId }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Usar imágenes de Supabase Storage si están disponibles
    if (product.images && product.images.length > 0) {
      // Usar la primera imagen disponible
      const img = new Image();
      img.onload = () => {
        setImgSrc(product.images[0]);
        setHasError(false);
      };
      img.onerror = () => {
        // Si la primera imagen falla, intentar con otras
        if (product.images.length > 1) {
          const nextImg = new Image();
          nextImg.onload = () => {
            setImgSrc(product.images[1]);
            setHasError(false);
          };
          nextImg.onerror = () => {
            setHasError(true);
          };
          nextImg.src = product.images[1];
        } else {
          setHasError(true);
        }
      };
      img.src = product.images[0];
    } else {
      // Fallback: si no hay imágenes en Supabase, marcar como error
      setHasError(true);
    }
  }, [product]);

  if (hasError) {
    // No mostrar el producto si no tiene imagen
    return null;
  }

  if (!imgSrc) {
    // Mostrar placeholder mientras carga
    return (
      <div className="group cursor-pointer">
        <article className="group">
          <div className="mb-4 aspect-[3/4] overflow-hidden bg-black animate-pulse">
            <div className="flex h-full w-full items-center justify-center bg-black/50">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="mb-1 font-body italic text-white/50">{product.name}</p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <Link
      to={`/product/${categoryId}/${product.code}`}
      className="group block cursor-pointer"
    >
      <article className="group">
        <div className="mb-4 aspect-[3/4] overflow-hidden bg-black">
          <img
            src={imgSrc}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="text-center">
          <p className="mb-1 font-body italic text-white">
            {product.name}, {product.artist}
          </p>
          <p className="text-sm text-white/70">Code {product.code}</p>
          <p className="mt-1 text-lg font-medium text-white">{product.price}</p>
        </div>
      </article>
    </Link>
  );
}
