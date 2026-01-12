import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('published', true)
        .order('code');

      if (error) throw error;

      const allProducts = data || [];
      setProducts(allProducts);
      
      // Obtener productos destacados ordenados
      const featured = allProducts
        .filter(p => p.is_featured === true)
        .sort((a, b) => {
          const orderA = a.featured_order || 999;
          const orderB = b.featured_order || 999;
          return orderA - orderB;
        });
      
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (code, currentValue) => {
    try {
      const featuredOrder = !currentValue ? (featuredProducts.length + 1) : null;
      
      const { error } = await supabase
        .from('products')
        .update({ 
          is_featured: !currentValue,
          featured_order: featuredOrder || null
        })
        .eq('code', code);

      if (error) throw error;
      
      await fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Error al cambiar destacado');
    }
  };

  const updateFeaturedOrder = async (code, newOrder) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured_order: newOrder })
        .eq('code', code);

      if (error) throw error;
      
      await fetchProducts();
    } catch (error) {
      console.error('Error updating featured order:', error);
      alert('Error al actualizar el orden');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white mb-2">
          🏠 Gestión de Home
        </h1>
        <p className="text-sm text-white/50">
          Selecciona y ordena los productos que aparecerán en la página principal
        </p>
      </div>

      {/* Productos Destacados */}
      <div className="mb-8 p-6 bg-black border border-white/10">
        <div className="mb-6">
          <h2 className="text-lg font-display uppercase tracking-[0.15em] text-white mb-2">
            ⭐ Productos Destacados en Home
          </h2>
          <p className="text-xs text-white/50">
            Los primeros 8 productos aparecerán en la home. Arrastra o usa los botones para cambiar el orden.
          </p>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="p-8 text-center border border-white/10">
            <p className="text-white/50 text-sm mb-4">No hay productos destacados todavía</p>
            <p className="text-white/40 text-xs">Marca productos como destacados desde la lista de abajo</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div
                  key={product.code}
                  className={`relative border-2 p-3 ${
                    index < 8 
                      ? 'border-accent bg-accent/10' 
                      : 'border-white/20 bg-black/50'
                  }`}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-white/10 mb-2">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                        Sin img
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-white/70">{product.code}</span>
                    <span className="text-xs text-accent font-bold">#{index + 1}</span>
                  </div>
                  <p className="text-[10px] text-white/80 truncate mb-2">{product.name || '—'}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        if (index > 0) {
                          updateFeaturedOrder(product.code, index);
                          updateFeaturedOrder(featuredProducts[index - 1].code, index + 1);
                        }
                      }}
                      disabled={index === 0}
                      className="flex-1 px-2 py-1 text-[10px] bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Subir"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => {
                        if (index < featuredProducts.length - 1 && index < 7) {
                          updateFeaturedOrder(product.code, index + 2);
                          updateFeaturedOrder(featuredProducts[index + 1].code, index + 1);
                        }
                      }}
                      disabled={index === featuredProducts.length - 1 || index >= 7}
                      className="flex-1 px-2 py-1 text-[10px] bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Bajar"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => toggleFeatured(product.code, true)}
                      className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      title="Quitar destacado"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {featuredProducts.length > 8 && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-400 text-center">
                  ⚠️ Tienes {featuredProducts.length} productos destacados, pero solo se muestran los primeros 8 en la home.
                  Los productos adicionales aparecen aquí:
                </p>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {featuredProducts.slice(8).map((product) => (
                    <div key={product.code} className="border border-white/20 p-2">
                      <div className="aspect-[3/4] overflow-hidden bg-white/10 mb-1">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">Sin img</div>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-white/70">{product.code}</p>
                      <button
                        onClick={() => toggleFeatured(product.code, true)}
                        className="mt-1 w-full px-2 py-1 text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lista de todos los productos para seleccionar */}
      <div className="p-6 bg-black border border-white/10">
        <h2 className="text-lg font-display uppercase tracking-[0.15em] text-white mb-4">
          Todos los Productos
        </h2>
        <p className="text-xs text-white/50 mb-4">
          Haz clic en ⭐ para marcar/desmarcar como destacado
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const isFeatured = featuredProducts.some(p => p.code === product.code);
            return (
              <div
                key={product.code}
                className={`border-2 p-2 ${
                  isFeatured 
                    ? 'border-accent bg-accent/5' 
                    : 'border-white/10 bg-black/50'
                }`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-white/10 mb-2">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                      Sin img
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-mono text-white/70 mb-1">{product.code}</p>
                <p className="text-[10px] text-white/80 truncate mb-2">{product.name || '—'}</p>
                <button
                  onClick={() => toggleFeatured(product.code, isFeatured)}
                  className={`w-full px-2 py-1 text-[10px] transition-colors ${
                    isFeatured
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {isFeatured ? '⭐ Destacado' : '☆ Marcar'}
                </button>
                <Link
                  to={`/admin-jdm-private/products/${product.code}`}
                  className="block mt-1 text-center text-[10px] text-white/50 hover:text-white"
                >
                  Editar →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
