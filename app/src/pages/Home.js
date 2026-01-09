import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useSGCollections } from "../hooks/useSGGallery";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { optimizeImageUrl } from "../utils/imageOptimizer";

// Imagen hero desde Supabase Storage (optimizada)
const images = {
  hero: optimizeImageUrl(
    "https://vnefocljtdvkabfxwoqg.supabase.co/storage/v1/object/public/product-images/hero/hero-bg.jpg",
    { width: 1920, quality: 85, format: 'webp' }
  ),
};

// Componente para mostrar una colección de la galería
function CollectionCard({ collection, index }) {
  return (
    <Link
      to={`/sg-gallery/${collection.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden bg-black"
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Imagen de fondo */}
      {collection.cover_image ? (
        <img
          src={collection.cover_image}
          alt={collection.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
      )}
      
      {/* Overlay degradado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/95" />
      
      {/* Contenido */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <h3 className="font-display text-lg uppercase tracking-[0.15em] text-white transition-colors group-hover:text-accent sm:text-xl md:text-2xl">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="mt-2 text-sm text-white/70 line-clamp-2 transition-colors group-hover:text-white/90">
            {collection.description}
          </p>
        )}
        
        {/* Indicador de explorar */}
        <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 transition-all group-hover:text-accent group-hover:gap-3">
          <span>Explorar</span>
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
        </div>
      </div>
      
      {/* Borde decorativo en hover */}
      <div className="absolute inset-0 border border-white/0 transition-colors duration-300 group-hover:border-white/20" />
    </Link>
  );
}

export default function Home() {
  // Obtener productos destacados (8 piezas para completar dos filas)
  const { products: allProducts, loading: loadingProducts } = useProducts();
  const featuredProducts = allProducts.slice(0, 8);
  
  // Obtener colecciones de SG Gallery
  const { collections, loading: loadingCollections } = useSGCollections();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex-1">
        {/* Spacer para el header fijo */}
        <div className="h-16 sm:h-20" />

        {/* Featured Products Section - Piezas Seleccionadas */}
        <section className="bg-black py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
            <div className="mb-8 text-center sm:mb-12">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">Destacados</p>
              <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl lg:text-5xl">
                Piezas Seleccionadas
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:mt-4 sm:text-base">
                Una cuidadosa selección de nuestras esculturas más icónicas
              </p>
            </div>

            {loadingProducts ? (
              <div className="text-center py-10">
                <p className="text-white/70">Cargando productos destacados...</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.code}
                    product={product}
                    categoryId={product.categoryId}
                    index={index}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 text-center sm:mt-12">
              <Link
                to="/shop"
                className="inline-block border border-white/20 px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-white transition-all hover:border-accent hover:text-accent sm:px-8 sm:py-3 sm:text-sm sm:tracking-[0.2em]"
              >
                Ver todos los productos
              </Link>
            </div>
          </div>
        </section>

        {/* The SG Gallery Section */}
        <section 
          className="relative bg-black py-16 sm:py-20 md:py-24 overflow-hidden"
          style={{
            backgroundImage: images.hero 
              ? `linear-gradient(rgba(0,0,0,0.92), rgba(0,0,0,0.88)), url(${images.hero})` 
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          {/* Overlay decorativo superior */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
            <div className="mb-10 text-center sm:mb-14">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">Galería</p>
              <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl lg:text-5xl">
                The SG Gallery
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:mt-4 sm:text-base">
                Descubre nuestras colecciones exclusivas de fotografía artística
              </p>
            </div>

            {loadingCollections ? (
              <div className="text-center py-10">
                <p className="text-white/70">Cargando colecciones...</p>
              </div>
            ) : collections.length > 0 ? (
              <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {collections.map((collection, index) => (
                  <CollectionCard 
                    key={collection.id} 
                    collection={collection}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-white/50 text-sm">
                  Próximamente: nuevas colecciones disponibles
                </p>
              </div>
            )}
          </div>
          
          {/* Overlay decorativo inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </section>
      </div>
      <Footer />
    </div>
  );
}
