import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProductCard({ product, categoryId }) {
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
  };

  const imageSrc = `/images/categorias/${categoryId}/${product.folder}/DSC04562 (1).jpg`;

  return (
    <Link
      to={`/product/${categoryId}/${product.code}`}
      className="group block cursor-pointer"
    >
      <article className="group">
        <div className="mb-4 aspect-[3/4] overflow-hidden bg-black">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-black/80">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-xs text-white/50">Imagen no disponible</p>
              </div>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={product.name}
              onError={handleImageError}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          )}
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

