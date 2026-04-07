import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

const navItems = [
  { to: '/admin-jdm-private/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin-jdm-private/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin-jdm-private/orders', label: 'Pedidos', icon: '📦' },
  { to: '/admin-jdm-private/home', label: 'Home', icon: '🏠' },
  { to: '/admin-jdm-private/products', label: 'Productos', icon: '🗿' },
  { to: '/admin-jdm-private/product-sg-relations', label: 'Productos ↔ SG Gallery', icon: '📷' },
  { to: '/admin-jdm-private/categories', label: 'Categorías', icon: '📁' },
  { to: '/admin-jdm-private/images', label: 'Imágenes', icon: '🖼️' },
  { to: '/admin-jdm-private/sg-gallery', label: 'SG Gallery', icon: '🎨' },
  { to: '/admin-jdm-private/settings', label: 'Ajustes', icon: '⚙️' },
];

export default function AdminLayout() {
  const { user, isAuthorized, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAuthorized)) {
      navigate('/admin-jdm-private');
    }
  }, [user, isAuthorized, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin-jdm-private');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Barra superior móvil */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-black border-b border-white/10 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col gap-1.5 p-1"
          aria-label="Abrir menú"
        >
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
        <span className="font-display text-sm uppercase tracking-[0.2em] text-white">TSG Admin</span>
        <div className="w-8" />
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-black border-r border-white/10 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-sm uppercase tracking-[0.2em] text-white">
              TSG Admin
            </h1>
            <p className="text-xs text-white/50 mt-1 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/50 hover:text-white text-xl leading-none"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white border-r-2 border-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <span>🚪</span>
            Cerrar Sesión
          </button>
          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="w-full mt-2 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <span>🌐</span>
            Ver Web
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
