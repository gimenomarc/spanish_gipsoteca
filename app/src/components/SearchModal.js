import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { products } = useProducts();

  // Filtrar productos
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.artist && product.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 6); // Limitar a 6 resultados

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      closeSearch();
      setSearchTerm('');
    }
  };

  const handleProductClick = () => {
    closeSearch();
    setSearchTerm('');
  };

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
        setSearchTerm('');
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={closeSearch}
      />
      <div className="fixed inset-x-0 top-0 z-50 mx-auto max-w-4xl px-4 pt-20 sm:pt-24">
        <div className="rounded-sm border border-white/20 bg-black/95 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                autoFocus
                className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3 pr-12 text-white placeholder-white/30 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
              >
                <SearchIcon />
              </button>
            </div>
          </form>

          {searchTerm && (
            <div>
              {filteredProducts.length > 0 ? (
                <>
                  <p className="mb-4 text-sm text-white/70">
                    {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredProducts.map((product) => (
                      <div key={`${product.categoryId}-${product.code}`} onClick={handleProductClick}>
                        <ProductCard
                          product={product}
                          categoryId={product.categoryId}
                        />
                      </div>
                    ))}
                  </div>
                  {filteredProducts.length >= 6 && (
                    <button
                      onClick={() => {
                        navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
                        closeSearch();
                        setSearchTerm('');
                      }}
                      className="mt-4 w-full rounded-sm border border-white/20 px-4 py-2 text-sm text-white transition-all hover:border-white/40 hover:bg-white/10"
                    >
                      Ver todos los resultados
                    </button>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-white/70">No se encontraron productos</p>
                </div>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="py-8 text-center">
              <p className="text-white/50">Escribe para buscar productos...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
