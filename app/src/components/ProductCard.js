import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProductCard({ product, categoryId }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Intentar cargar la imagen con diferentes nombres comunes
    const productCode = product.code;
    const basePath = `/images/categorias/${categoryId}/${product.folder}/`;
    
    // Lista de posibles nombres de archivos
    const possibleImages = [
      `${productCode}.jpg`,
      `${productCode}.png`,
      `DSC04562 (1).jpg`,
      `DSC04584.jpg`,
      `DSC04551.jpg`,
      `DSC04571.jpg`,
      `DSC04378 (1).jpg`,
      `DSC04503.jpg`,
      `DSC03549.jpg`,
      `DSC03561.jpg`,
      `DSC03892.jpg`,
      `DSC03506.jpg`,
      `DSC03619.jpg`,
      `DSC04408.jpg`,
      `la buena.jpg`,
      `DSC03985.jpg`,
      `DSC04013.jpg`,
      `DSC04005.jpg`,
      `DSC03590.jpg`,
      `DSC04427.jpg`,
      `DSC04342.jpg`,
      `DSC03675.jpg`,
      `DSC04332.jpg`,
      `DSC04350.jpg`,
      `DSC03778 (1).jpg`,
      `DSC03702.jpg`,
      `DSC04114.jpg`,
      `DSC04634 (1).jpg`,
      `DSC04206.jpg`,
      `DSC03824.jpg`,
      `DSC04234 (1).jpg`,
      `DSC02490.jpg`,
      `DSC04277.jpg`,
      `DSC04289.jpg`,
      `DSC04041.jpg`,
      `DSC03870.jpg`,
      `DSC03907.jpg`,
      `DSC03949.jpg`,
      `DSC03939 (1).jpg`,
      `DSC03839 (1) (1).jpg`,
      `DSC03969.jpg`,
      `DSC02686.jpg`,
      `DSC04849.jpg`,
      `DSC02537 (1) (1).jpg`,
      `DSC02541 (1).jpg`,
      `DSC04166 (1).jpg`,
      `DSC04181.jpg`,
      `DSC04188.jpg`,
      `DSC04604 (1).jpg`,
      `DSC04596.jpg`,
      `DSC04186.jpg`,
      `DSC02722.jpg`,
      `DSC04061 (1).jpg`,
      `DSC04055.jpg`,
      `DSC04611.jpg`,
      `DSC04196 (1).jpg`,
    ];

    // Función para probar cada imagen
    const tryLoadImage = async (imageNames, index = 0) => {
      if (index >= imageNames.length) {
        setHasError(true);
        return;
      }

      const img = new Image();
      const imagePath = `${basePath}${imageNames[index]}`;
      
      img.onload = () => {
        setImgSrc(imagePath);
        setHasError(false);
      };
      
      img.onerror = () => {
        // Intentar con la siguiente imagen
        tryLoadImage(imageNames, index + 1);
      };
      
      img.src = imagePath;
    };

    tryLoadImage(possibleImages);
  }, [product, categoryId]);

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
