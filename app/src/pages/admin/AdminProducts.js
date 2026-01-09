import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.artist?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || p.category_id === categoryFilter;
      
      return matchesSearch && matchesCategory;
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
