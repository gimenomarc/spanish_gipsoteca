import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

// Imagen hero - reemplaza con tu propia imagen cuando la tengas
const images = {
  hero: "/images/hero/hero-bg.jpg", // Coloca tu imagen en public/images/hero/hero-bg.jpg
};

export default function Home() {
  // Obtener productos destacados (los primeros 6 de Máscaras y Bustos)
  const { products: mascarasProducts, loading: loadingMascaras } = useProducts("mascaras-y-bustos");
  const featuredProducts = mascarasProducts.slice(0, 6);
  
  // Obtener algunos productos de otras categorías para mostrar variedad
  const { products: allProducts, loading: loadingAll } = useProducts();
  const moreProducts = allProducts.slice(6, 12);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
      <div className="flex-1">
      {/* Hero Section */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center bg-no-repeat sm:bg-fixed"
        style={{
          backgroundImage: images.hero ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${images.hero})` : "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.95))",
          backgroundColor: "#000000",
        }}
      >
        <div className="relative z-10 max-w-4xl px-4 text-center sm:px-6 md:px-10">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-accent sm:mb-4 sm:text-sm">Home</p>
          <h2 className="mb-4 font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:tracking-[0.2em] sm:mb-6 md:text-5xl lg:text-6xl">
            The Cast Collection
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base sm:mb-8 md:text-lg">
            Una selección de moldes clásicos y contemporáneos. Piezas icónicas reinterpretadas con una presencia escénica, listas para galerías, museos y colecciones privadas.
          </p>
          <Link
            to="/shop"
            className="inline-block rounded-sm bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 hover:shadow-lg sm:px-8 sm:py-3 sm:text-sm sm:tracking-[0.2em] md:px-10"
          >
            Explorar colección
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
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

          {loadingMascaras ? (
            <div className="text-center py-10">
              <p className="text-white/70">Cargando productos destacados...</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.code}
                  product={product}
                  categoryId="mascaras-y-bustos"
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

      {/* More Products Section */}
      {!loadingAll && moreProducts.length > 0 && (
        <section className="border-t border-white/10 bg-black/60 py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-white md:text-4xl">
                Más Obras
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {moreProducts.map((product) => (
                <ProductCard
                  key={`${product.categoryId}-${product.code}`}
                  product={product}
                  categoryId={product.categoryId}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      </div>
      <Footer />
    </div>
  );
}

