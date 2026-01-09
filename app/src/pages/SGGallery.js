import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSGCollections } from "../hooks/useSGGallery";
import Footer from "../components/Footer";

// Componente para lazy loading de imágenes hero
function LazyHeroImage({ src, srcHero, alt, priority = false }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Precargar 200px antes de que aparezca
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Usar la versión hero para pantallas grandes si está disponible
  const imageSrc = srcHero || src;

  return (
    <div ref={imgRef} className="absolute inset-0">
      {/* Placeholder con gradiente mientras carga */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-neutral-900 to-black transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Imagen */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

export default function SGGallery() {
  const { collections, loading } = useSGCollections();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Cargando colecciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex-1">
        {/* Spacer para el header fijo */}
        <div className="h-16 sm:h-20" />

        {/* Colecciones como secciones hero full-width */}
        {collections.length > 0 ? (
          <div className="flex flex-col">
            {collections.map((collection, index) => (
              <Link
                key={collection.id}
                to={`/sg-gallery/${collection.slug}`}
                className="group relative block w-full h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden"
              >
                {/* Imagen de fondo con lazy loading */}
                {collection.cover_image ? (
                  <LazyHeroImage
                    src={collection.cover_image}
                    srcHero={collection.cover_image_hero}
                    alt={collection.name}
                    priority={index === 0} // Primera imagen se carga inmediatamente
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
                )}
                
                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
                
                {/* Contenido centrado */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.2em] text-white mb-4 sm:mb-6">
                    {collection.name}
                  </h2>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/70">
                    The SG Gallery
                  </p>
                  
                  {/* Indicador de explorar en hover */}
                  <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/80 border border-white/30 px-6 py-3 group-hover:border-white/60 transition-colors">
                      Explorar colección
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        className="transition-transform group-hover:translate-x-1"
                      >
                        <path 
                          d="M5 12H19M19 12L12 5M19 12L12 19" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Número de colección */}
                <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
                  <span className="text-6xl sm:text-8xl font-display text-white/10">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-white/50 text-sm mb-4">
                Próximamente: nuevas colecciones disponibles
              </p>
              <Link
                to="/"
                className="text-accent hover:text-accent/80 text-xs uppercase tracking-[0.2em]"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
