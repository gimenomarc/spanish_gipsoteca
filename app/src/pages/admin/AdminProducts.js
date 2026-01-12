import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('all'); // 'all', 'published', 'unpublished'
  const [featuredFilter, setFeaturedFilter] = useState('all'); // 'all', 'featured', 'not_featured'
  const [sortBy, setSortBy] = useState('code');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('code');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto ${code}?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('code', code);

      if (error) throw error;
      setProducts(products.filter(p => p.code !== code));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  // Toggle publicado
  const togglePublished = async (code, currentValue) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: !currentValue })
        .eq('code', code);

      if (error) throw error;
      
      setProducts(products.map(p => 
        p.code === code ? { ...p, published: !currentValue } : p
      ));
    } catch (error) {
      console.error('Error toggling published:', error);
      alert('Error al cambiar el estado');
    }
  };

  // Toggle destacado
  const toggleFeatured = async (code, currentValue) => {
    try {
      // Si está marcando como destacado, asignar un orden
      const featuredOrder = !currentValue ? (products.filter(p => p.is_featured).length + 1) : null;
      
      const { error } = await supabase
        .from('products')
        .update({ 
          is_featured: !currentValue,
          featured_order: featuredOrder || null
        })
        .eq('code', code);

      if (error) throw error;
      
      setProducts(products.map(p => 
        p.code === code ? { ...p, is_featured: !currentValue, featured_order: featuredOrder || null } : p
      ));
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Error al cambiar destacado');
    }
  };

  // Actualizar orden destacado
  const updateFeaturedOrder = async (code, newOrder) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured_order: newOrder })
        .eq('code', code);

      if (error) throw error;
      
      // Refrescar productos para obtener el orden actualizado
      await fetchProducts();
    } catch (error) {
      console.error('Error updating featured order:', error);
      alert('Error al actualizar el orden');
    }
  };

  // Obtener productos destacados ordenados
  const featuredProducts = products
    .filter(p => p.is_featured === true && p.published === true)
    .sort((a, b) => {
      const orderA = a.featured_order || 999;
      const orderB = b.featured_order || 999;
      return orderA - orderB;
    });

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.artist?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || p.category_id === categoryFilter;
      
      const matchesPublished = publishedFilter === 'all' || 
        (publishedFilter === 'published' && p.published === true) ||
        (publishedFilter === 'unpublished' && p.published === false);
      
      const matchesFeatured = featuredFilter === 'all' ||
        (featuredFilter === 'featured' && p.is_featured === true) ||
        (featuredFilter === 'not_featured' && p.is_featured !== true);
      
      return matchesSearch && matchesCategory && matchesPublished && matchesFeatured;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price':
          const priceA = parseFloat((a.price || '0').replace(/[^\d,]/g, '').replace(',', '.'));
          const priceB = parseFloat((b.price || '0').replace(/[^\d,]/g, '').replace(',', '.'));
          return priceB - priceA;
        default:
          return (a.code || '').localeCompare(b.code || '');
      }
    });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
            Productos
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {filteredProducts.length} de {products.length} productos
          </p>
        </div>
        <Link
          to="/admin-jdm-private/products/new"
          className="bg-white text-black px-6 py-2 text-sm uppercase tracking-[0.1em] hover:bg-white/90 transition-colors"
        >
          + Nuevo Producto
        </Link>
      </div>

      {/* Sección de Productos Destacados para Home */}
      {featuredProducts.length > 0 && (
        <div className="mb-8 p-6 bg-black border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-display uppercase tracking-[0.15em] text-white mb-1">
                ⭐ Productos Destacados en Home
              </h2>
              <p className="text-xs text-white/50">
                {featuredProducts.length} producto{featuredProducts.length !== 1 ? 's' : ''} destacado{featuredProducts.length !== 1 ? 's' : ''} 
                {featuredProducts.length > 8 && (
                  <span className="text-yellow-400 ml-2">
                    (Se muestran los primeros 8 en la home)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setFeaturedFilter(featuredFilter === 'featured' ? 'all' : 'featured')}
              className="px-4 py-2 text-xs uppercase tracking-[0.1em] bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {featuredFilter === 'featured' ? 'Ver Todos' : 'Ver Solo Destacados'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <div
                key={product.code}
                className={`relative border-2 p-2 ${
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
                <p className="text-[10px] text-white/80 truncate">{product.name || '—'}</p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) {
                        updateFeaturedOrder(product.code, index);
                        updateFeaturedOrder(featuredProducts[index - 1].code, index + 1);
                      }
                    }}
                    disabled={index === 0}
                    className="flex-1 px-1 py-0.5 text-[10px] bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Subir"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < featuredProducts.length - 1 && index < 7) {
                        updateFeaturedOrder(product.code, index + 2);
                        updateFeaturedOrder(featuredProducts[index + 1].code, index + 1);
                      }
                    }}
                    disabled={index === featuredProducts.length - 1 || index >= 7}
                    className="flex-1 px-1 py-0.5 text-[10px] bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Bajar"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
            {featuredProducts.length > 8 && (
              <div className="col-span-full mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-400 text-center">
                  ⚠️ Tienes {featuredProducts.length} productos destacados, pero solo se muestran los primeros 8 en la home.
                  Considera desmarcar algunos o ajustar el orden.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, código o artista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="all">Todos</option>
          <option value="published">✓ Publicados</option>
          <option value="unpublished">✗ No publicados</option>
        </select>

        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="all">Todos</option>
          <option value="featured">⭐ Destacados</option>
          <option value="not_featured">☆ No destacados</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="code">Ordenar por Código</option>
          <option value="name">Ordenar por Nombre</option>
          <option value="price">Ordenar por Precio</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-black border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Imagen
                </th>
                <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Código
                </th>
                <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Nombre
                </th>
                <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Artista
                </th>
                <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Precio
                </th>
                <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Categoría
                </th>
                <th className="text-center p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Publicado
                </th>
                <th className="text-center p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Destacado
                </th>
                <th className="text-right p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.code}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin-jdm-private/products/${product.code}`)}
                >
                  <td className="p-4">
                    <div className="w-12 h-12 bg-white/10 overflow-hidden">
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
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-mono text-white/70">{product.code}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white">{product.name || '—'}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white/70">{product.artist || '—'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${product.price ? 'text-green-400' : 'text-white/30'}`}>
                      {product.price || 'Sin precio'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-white/10 text-white/70">
                      {product.categories?.name || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => togglePublished(product.code, product.published)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        product.published 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      {product.published ? '✓ Sí' : '✗ No'}
                    </button>
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFeatured(product.code, product.is_featured)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        product.is_featured 
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                          : 'bg-white/10 text-white/50 hover:bg-white/20'
                      }`}
                    >
                      {product.is_featured ? '⭐ Sí' : '☆ No'}
                    </button>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin-jdm-private/products/${product.code}`)}
                        className="px-3 py-1 text-xs bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.code)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-white/50">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
