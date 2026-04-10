import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import useSEO from "../hooks/useSEO";
import { imagePresets } from "../utils/imageOptimizer";
import { searchInFields } from "../utils/textNormalizer";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PRODUCTS_PER_PAGE = 12;

export default function Shop() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
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

  // SEO dinámico según categoría activa
  const activeCategory = selectedCategory ? categories[selectedCategory] : null;
  useSEO({
    title: activeCategory ? activeCategory.name : 'Tienda',
    description: activeCategory
      ? `Explora nuestra colección de ${activeCategory.name.toLowerCase()} — reproducciones artesanales en escayola.`
      : 'Compra vaciados de escayola y moldes artesanales en Barcelona. The Spanish Gipsoteca — más de 100 reproducciones escultóricas clásicas: bustos, figuras y piezas arquitectónicas.',
    canonical: selectedCategory ? `/shop/${selectedCategory}` : '/shop',
  });

  // Reset paginación cuando cambian los filtros
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [searchTerm, artistFilter, selectedCategory]);

  // Manejar cambio de categoría
  const handleCategoryChange = useCallback((catId) => {
    setSelectedCategory(catId);
    if (catId) {
      navigate(`/shop/${catId}`);
    } else {
      navigate("/shop");
    }
  }, [navigate]);

  // Obtener nombre de categoría
  let categoryName = "Tienda";
  if (selectedCategory && categories[selectedCategory]) {
    categoryName = categories[selectedCategory].name;
  } else if (!selectedCategory) {
    categoryName = "Todos los Productos";
  }

  // Obtener lista única de artistas (memoizado para evitar recálculo)
  const artists = useMemo(
    () => [...new Set(products.map(p => p.artist).filter(Boolean))].sort(),
    [products]
  );

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

  // Preload de las primeras 4 imágenes críticas (above the fold)
  useEffect(() => {
    if (filteredProducts.length === 0) return;
    filteredProducts.slice(0, 4).forEach((product) => {
      if (product.images?.[0]) {
        const img = new Image();
        img.src = imagePresets.card(product.images[0]);
        img.fetchPriority = 'high';
      }
    });
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

          {/* Cabecera: título + contador */}
          <div className="mb-6 sm:mb-8">
            <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white sm:text-3xl md:text-4xl">
              {categoryName}
            </h2>
            <p className="mt-1.5 text-xs tracking-widest text-white/40 uppercase">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>
          </div>

          {/* Barra de herramientas: filtros de categoría + búsqueda + artista + catálogo */}
          <div className="mb-8 sm:mb-12 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Filtros de categorías */}
            {!categoriesLoading && Object.keys(categories).length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`h-9 px-4 text-xs uppercase tracking-[0.15em] transition-all ${
                    !selectedCategory
                      ? "border border-white bg-white text-black"
                      : "border border-white/20 bg-transparent text-white/70 hover:border-white/40 hover:text-white"
                  }`}
                >
                  Todos
                </button>
                {Object.values(categories).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`h-9 px-4 text-xs uppercase tracking-[0.15em] transition-all ${
                      selectedCategory === category.id
                        ? "border border-white bg-white text-black"
                        : "border border-white/20 bg-transparent text-white/70 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {/* Controles: búsqueda + artista + catálogo */}
            <div className="flex items-center gap-2">
              {/* Búsqueda */}
              <div className="relative flex-1 lg:flex-none lg:w-60">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 w-full border border-white/20 bg-transparent pl-9 pr-3 text-xs text-white placeholder-white/40 focus:border-white/60 focus:outline-none transition-colors"
                />
              </div>

              {/* Filtro por artista */}
              {artists.length > 0 && (
                <div className="relative flex-1 lg:flex-none lg:w-48">
                  <select
                    value={artistFilter}
                    onChange={(e) => setArtistFilter(e.target.value)}
                    className="h-9 w-full appearance-none border border-white/20 bg-black pr-8 pl-3 text-xs text-white focus:border-white/60 focus:outline-none transition-colors"
                    style={{ color: artistFilter ? 'white' : 'rgba(255,255,255,0.4)' }}
                  >
                    <option value="" className="bg-black text-white/40">Artista</option>
                    {artists.map((artist) => (
                      <option key={artist} value={artist} className="bg-black text-white">
                        {artist}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Separador */}
              <div className="hidden sm:block h-5 w-px bg-white/15" />

              {/* Ver Catálogo PDF */}
              <a
                href="/catalogo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex h-9 items-center gap-1.5 border border-white/20 bg-transparent px-3.5 text-xs uppercase tracking-[0.12em] text-white/60 transition-all hover:border-white/50 hover:text-white whitespace-nowrap"
              >
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Catálogo PDF
              </a>
            </div>
          </div>

          {/* Catálogo PDF — sólo móvil */}
          <div className="mb-6 sm:hidden">
            <a
              href="/catalogo.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 border border-white/20 bg-transparent px-3.5 text-xs uppercase tracking-[0.12em] text-white/60 transition-all hover:border-white/50 hover:text-white"
            >
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Ver Catálogo PDF
            </a>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center sm:py-20">
              <p className="text-sm text-white/70 sm:text-base">No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.slice(0, visibleCount).map((product, index) => (
                  <ProductCard
                    key={`${product.categoryId || categoryId || "all"}-${product.code}`}
                    product={product}
                    categoryId={product.categoryId || categoryId || ""}
                    index={index}
                  />
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="mt-10 sm:mt-14 flex flex-col items-center gap-3">
                  <button
                    onClick={() => setVisibleCount(v => v + PRODUCTS_PER_PAGE)}
                    className="border border-white/30 bg-transparent px-10 py-3 text-xs uppercase tracking-[0.2em] text-white transition-all hover:border-white hover:bg-white hover:text-black sm:text-sm"
                  >
                    Ver más
                  </button>
                  <p className="text-xs text-white/40">
                    {Math.min(visibleCount, filteredProducts.length)} de {filteredProducts.length} productos
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}

