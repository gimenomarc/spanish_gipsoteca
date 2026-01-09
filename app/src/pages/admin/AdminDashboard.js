import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    categories: 0,
    withImages: 0,
    withPrice: 0,
    recentProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total de productos
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Productos con imágenes
      const { data: productsWithImages } = await supabase
        .from('products')
        .select('code, images')
        .not('images', 'is', null);

      const withImages = productsWithImages?.filter(p => p.images && p.images.length > 0).length || 0;

      // Productos con precio
      const { count: withPrice } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .not('price', 'is', null);

      // Categorías
      const { count: categories } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      // Productos recientes
      const { data: recentProducts } = await supabase
        .from('products')
        .select('code, name, price, images, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalProducts: totalProducts || 0,
        publishedProducts: withImages || 0,
        categories: categories || 0,
        withImages: withImages || 0,
        withPrice: withPrice || 0,
        recentProducts: recentProducts || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'white' }) => (
    <div className="bg-black border border-white/10 p-6 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 mb-2">{title}</p>
          <p className={`text-4xl font-light text-${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-white/40 mt-2">{subtitle}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
          Dashboard
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Resumen de tu tienda
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Productos"
          value={stats.totalProducts}
          icon="🗿"
        />
        <StatCard
          title="Con Imágenes"
          value={stats.withImages}
          subtitle={`${Math.round((stats.withImages / stats.totalProducts) * 100) || 0}% del total`}
          icon="🖼️"
        />
        <StatCard
          title="Con Precio"
          value={stats.withPrice}
          subtitle={`${Math.round((stats.withPrice / stats.totalProducts) * 100) || 0}% del total`}
          icon="💰"
        />
        <StatCard
          title="Categorías"
          value={stats.categories}
          icon="📁"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/admin-jdm-private/products/new"
          className="bg-white text-black p-6 hover:bg-white/90 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-medium">Añadir Producto</p>
              <p className="text-sm text-black/60">Crear nuevo producto</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin-jdm-private/products"
          className="bg-black border border-white/10 p-6 hover:border-white/30 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-white">Gestionar Productos</p>
              <p className="text-sm text-white/60">Editar precios, descripciones...</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin-jdm-private/images"
          className="bg-black border border-white/10 p-6 hover:border-white/30 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">🖼️</span>
            <div>
              <p className="font-medium text-white">Gestionar Imágenes</p>
              <p className="text-sm text-white/60">Subir y organizar fotos</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Products */}
      <div className="bg-black border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-[0.15em] text-white/70">
            Productos Recientes
          </h2>
          <Link
            to="/admin-jdm-private/products"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        <div className="space-y-3">
          {stats.recentProducts.map((product) => (
            <Link
              key={product.code}
              to={`/admin-jdm-private/products/${product.code}`}
              className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors -mx-3 rounded"
            >
              <div className="w-12 h-12 bg-white/10 rounded overflow-hidden flex-shrink-0">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    🖼️
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{product.name}</p>
                <p className="text-xs text-white/50">{product.code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{product.price || '—'}</p>
              </div>
            </Link>
          ))}

          {stats.recentProducts.length === 0 && (
            <p className="text-sm text-white/50 text-center py-4">
              No hay productos todavía
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
        <p className="text-sm text-blue-400">
          <strong>💡 Tip:</strong> Usa el importador de Excel para actualizar productos masivamente. 
          El archivo debe estar en <code className="bg-black/50 px-1 rounded">public/data/Productos_Enero.xlsx</code>
        </p>
      </div>
    </div>
  );
}
