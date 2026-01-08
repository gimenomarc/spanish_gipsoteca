import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Shop() {
  const { categoryId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const { products, loading: productsLoading } = useProducts(categoryId || null);
  const { categories } = useCategories();

  // Obtener nombre de categoría
  let categoryName = "Tienda";
  if (categoryId && categories[categoryId]) {
    categoryName = categories[categoryId].name;
  } else if (!categoryId) {
    categoryName = "Todos los Productos";
  }

  // Filtrar por búsqueda
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.artist && product.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <section className="bg-black py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="text-center">
              <p className="text-white/70">Cargando productos...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16 sm:pt-20">
      <section className="bg-black py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="mb-8 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl">
                {categoryName}
              </h2>
              <p className="mt-1 text-xs text-white/70 sm:mt-2 sm:text-sm">
                {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-sm border border-white/20 bg-black/50 px-3 py-2 pr-9 text-sm text-white placeholder-white/50 focus:border-accent focus:outline-none sm:px-4 sm:pr-10 sm:text-base"
                />
                <SearchIcon className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 sm:right-3 sm:h-5 sm:w-5" />
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center sm:py-20">
              <p className="text-sm text-white/70 sm:text-base">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={`${product.categoryId || categoryId || "all"}-${product.code}`}
                  product={product}
                  categoryId={product.categoryId || categoryId || ""}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

