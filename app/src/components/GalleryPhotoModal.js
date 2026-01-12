import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSGPhotoDetail } from "../hooks/useSGGallery";
import { optimizeImageUrl } from "../utils/imageOptimizer";

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function GalleryPhotoModal({ 
  photoId, 
  onClose, 
  onNext, 
  onPrev, 
  hasNext, 
  hasPrev 
}) {
  const { photo, relatedProducts, loading, error } = useSGPhotoDetail(photoId);

  // Cerrar con tecla Escape y navegar con flechas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!photoId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full h-full max-h-screen overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-20 p-2 text-white/70 hover:text-white transition-colors bg-black/50 rounded-full"
          aria-label="Cerrar"
        >
          <CloseIcon />
        </button>

        {/* Navigation Arrows */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-20 p-3 text-white/70 hover:text-white transition-colors bg-black/50 rounded-full hover:bg-black/70"
            aria-label="Foto anterior"
          >
            <ArrowLeftIcon />
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-20 p-3 text-white/70 hover:text-white transition-colors bg-black/50 rounded-full hover:bg-black/70"
            aria-label="Foto siguiente"
          >
            <ArrowRightIcon />
          </button>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/70">Cargando...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-400">Error al cargar la foto</p>
          </div>
        ) : photo ? (
          <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Imagen principal - Más pequeña para ver productos relacionados */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] mb-6 bg-black/50 overflow-hidden max-w-3xl mx-auto">
                <img
                  src={photo.image_url_full || photo.image_url}
                  alt="Foto de SG Gallery"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Información de la foto */}
              <div className="max-w-3xl mx-auto">
                {/* Breadcrumb */}
                {photo.sg_gallery_collections && (
                  <Link 
                    to={`/sg-gallery/${photo.sg_gallery_collections.slug}`}
                    className="inline-block text-xs uppercase tracking-[0.2em] text-accent hover:text-accent/80 mb-4 transition-colors"
                  >
                    ← {photo.sg_gallery_collections.name}
                  </Link>
                )}

                {/* Descripción */}
                {photo.description && (
                  <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6">
                    {photo.description}
                  </p>
                )}

                {/* Información contextual */}
                {photo.context_info && (
                  <div className="border-t border-white/10 pt-6 mb-6">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                      Sobre esta obra
                    </h3>
                    <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                      {photo.context_info}
                    </p>
                  </div>
                )}

                {/* Productos relacionados */}
                {relatedProducts.length > 0 && (
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                      Esculturas en esta imagen
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {relatedProducts.map((product) => (
                        <Link
                          key={product.code}
                          to={`/product/${product.categoryId}/${product.code}`}
                          className="group block"
                          onClick={onClose}
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-black/50 mb-2">
                            {product.images && product.images[0] ? (
                              <img
                                src={optimizeImageUrl(product.images[0], { width: 300, quality: 75, format: 'webp' })}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30">
                                <span className="text-3xl">🗿</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-white group-hover:text-accent transition-colors truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-white/50">
                            {product.price || 'Consultar precio'}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
