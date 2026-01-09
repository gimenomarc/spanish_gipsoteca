import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSGCollection, useSGPhotos } from "../hooks/useSGGallery";
import GalleryPhotoModal from "../components/GalleryPhotoModal";
import Footer from "../components/Footer";

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function SGGalleryCollection() {
  const { collectionSlug } = useParams();
  const { collection, loading: loadingCollection, error: collectionError } = useSGCollection(collectionSlug);
  const { photos, loading: loadingPhotos } = useSGPhotos(collection?.id);
  
  // Estado para el modal de foto
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  if (loadingCollection) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/70">Cargando colección...</p>
        </div>
      </div>
    );
  }

  if (collectionError || !collection) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-white/70">Colección no encontrada</p>
          <Link
            to="/sg-gallery"
            className="text-accent hover:text-accent/80 text-sm uppercase tracking-[0.2em]"
          >
            Volver a la galería
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex-1">
        {/* Spacer para el header fijo */}
        <div className="h-16 sm:h-20" />

        {/* Header de la colección */}
        <section className="bg-black py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
            {/* Breadcrumb */}
            <Link
              to="/sg-gallery"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-accent transition-colors mb-8"
            >
              <ArrowLeftIcon />
              <span>The SG Gallery</span>
            </Link>

            <div className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.15em] text-white">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="mx-auto mt-6 max-w-2xl text-sm text-white/60 sm:text-base leading-relaxed">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Galería de fotos - Grid de 2 columnas con fotos grandes */}
        <section className="bg-black pb-16 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
            {loadingPhotos ? (
              <div className="text-center py-10">
                <p className="text-white/70">Cargando fotos...</p>
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoClick(index)}
                    className="group relative aspect-[4/3] overflow-hidden bg-black/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Overlay sutil en hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    
                    {/* Indicador de productos relacionados */}
                    {photo.product_codes && photo.product_codes.length > 0 && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-sm text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {photo.product_codes.length}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-white/50 text-sm">
                  Esta colección aún no tiene fotos
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Volver a la galería */}
        <section className="bg-black py-12 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 text-center">
            <Link
              to="/sg-gallery"
              className="inline-block text-sm uppercase tracking-[0.2em] text-white/50 hover:text-accent transition-colors"
            >
              ← Ver todas las colecciones
            </Link>
          </div>
        </section>
      </div>

      <Footer />

      {/* Modal de foto */}
      {selectedPhoto && (
        <GalleryPhotoModal
          photoId={selectedPhoto.id}
          onClose={handleCloseModal}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
          hasNext={selectedPhotoIndex < photos.length - 1}
          hasPrev={selectedPhotoIndex > 0}
        />
      )}
    </div>
  );
}
