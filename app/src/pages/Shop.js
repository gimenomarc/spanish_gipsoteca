import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { imagePresets } from "../utils/imageOptimizer";
import { searchInFields } from "../utils/textNormalizer";

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Shop() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null);
  const { products, loading: productsLoading } = useProducts(selectedCategory || null);
  const { categories, loading: categoriesLoading } = useCategories();

  // Leer parámetro de búsqueda de la URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Sincronizar selectedCategory con categoryId de la URL
  useEffect(() => {
    setSelectedCategory(categoryId || null);
  }, [categoryId]);

  // Manejar cambio de categoría
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      navigate(`/shop/${catId}`);
    } else {
      navigate("/shop");
    }
  };

  // Obtener nombre de categoría
  let categoryName = "Tienda";
  if (selectedCategory && categories[selectedCategory]) {
    categoryName = categories[selectedCategory].name;
  } else if (!selectedCategory) {
    categoryName = "Todos los Productos";
  }

  // Obtener lista única de artistas
  const artists = [...new Set(products.map(p => p.artist).filter(Boolean))].sort();

  // Filtrar por búsqueda y artista
  // Busca en: name (nombre de la obra), code (código) y artist (artista)
  // Usa normalización sin acentos para mejor búsqueda
  // IMPORTANTE: La búsqueda funciona igual que el buscador del header
  const filteredProducts = products.filter((product) => {
    // Búsqueda general: busca en nombre de obra (name), código (code) y artista (artist)
    // Si searchTerm está vacío, muestra todos los productos
    const matchesSearch = !searchTerm || searchInFields(
      product,
      ['name', 'code', 'artist'], // name = nombre de la obra
      searchTerm
    );
    
    // Filtro por artista específico (dropdown separado)
    // Este filtro es independiente de la búsqueda general
    const matchesArtist = !artistFilter || 
      (product.artist && searchInFields(product, ['artist'], artistFilter));
    
    // El producto debe cumplir AMBAS condiciones: búsqueda Y filtro de artista
    return matchesSearch && matchesArtist;
  });

  // Preload optimizado: solo las primeras 4 imágenes críticas (above the fold)
  // Eliminado preload duplicado - OptimizedImage ya maneja el preload con priority
  // Este efecto solo precarga las primeras 4 para mejorar el tiempo inicial de carga
  useEffect(() => {
    if (filteredProducts.length === 0) return;

    // Reducido a 4 imágenes para evitar sobrecarga
    const criticalProducts = filteredProducts.slice(0, 4);
    const preloadImgs = [];

    criticalProducts.forEach((product) => {
      if (product.images && product.images.length > 0) {
        const mainImage = product.images[0];
        const optimizedUrl = imagePresets.card(mainImage);
        
        // Solo usar Image() para preload, más eficiente
        const img = new Image();
        img.src = optimizedUrl;
        img.fetchPriority = 'high';
        preloadImgs.push(img);
      }
    });

    // No necesitamos cleanup para Image objects, el navegador los maneja
  }, [filteredProducts]);

  if (productsLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
        <div className="flex-1">
          <section className="bg-black py-20">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <div className="text-center">
                <p className="text-white/70">Cargando productos...</p>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
      <div className="flex-1">
      <section className="bg-black py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          {/* Filtros de categorías */}
          {!categoriesLoading && Object.keys(categories).length > 0 && (
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition-all sm:px-6 sm:py-2.5 sm:text-sm sm:tracking-[0.2em] ${
                    !selectedCategory
                      ? "border border-white bg-white text-black"
                      : "border border-white/20 bg-black/50 text-white hover:border-white/40"
                  }`}
                >
                  Todos
                </button>
                {Object.values(categories).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition-all sm:px-6 sm:py-2.5 sm:text-sm sm:tracking-[0.2em] ${
                      selectedCategory === category.id
                        ? "border border-white bg-white text-black"
                        : "border border-white/20 bg-black/50 text-white hover:border-white/40"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 flex flex-col gap-6 sm:mb-12 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 md:gap-6">
                <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl">
                  {categoryName}
                </h2>
                <a
                  href="/catalogo.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 sm:mt-0 whitespace-nowrap inline-flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.15em] text-white/80 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <svg 
                    className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                    />
                  </svg>
                  <span className="whitespace-nowrap">Ver Catálogo PDF</span>
                </a>
              </div>
              <p className="mt-1 text-xs text-white/70 sm:mt-2 sm:text-sm">
                {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
              </p>
            </div>
            
            {/* Búsqueda y filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              {/* Búsqueda general */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o artista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-sm border border-white/20 bg-black/50 px-10 py-2.5 text-sm text-white placeholder-white/50 focus:border-white focus:outline-none sm:px-12 sm:py-2.5 sm:text-sm"
                />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon className="h-4 w-4 text-white/50 sm:h-4 sm:w-4" />
                </div>
              </div>
              
              {/* Filtro por artista */}
              {artists.length > 0 && (
                <div className="relative w-full sm:w-56">
                  <select
                    value={artistFilter}
                    onChange={(e) => setArtistFilter(e.target.value)}
                    className="w-full appearance-none rounded-sm border border-white/20 bg-black/50 px-4 py-2.5 pr-10 text-sm text-white focus:border-white focus:outline-none sm:px-4 sm:py-2.5 sm:pr-10 sm:text-sm"
                  >
                    <option value="">Todos los artistas</option>
                    {artists.map((artist) => (
                      <option key={artist} value={artist} className="bg-black">
                        {artist}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 text-white/50 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center sm:py-20">
              <p className="text-sm text-white/70 sm:text-base">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={`${product.categoryId || categoryId || "all"}-${product.code}`}
                  product={product}
                  categoryId={product.categoryId || categoryId || ""}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}

