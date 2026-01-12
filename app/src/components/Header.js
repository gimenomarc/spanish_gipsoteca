import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MenuPanel from "./MenuPanel";
import SearchModal from "./SearchModal";
import CartSidebar from "./CartSidebar";
import { useSearch } from "../context/SearchContext";
import { useCart } from "../context/CartContext";

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
  </svg>
);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartAnimation, setCartAnimation] = useState(false);
  const { openSearch } = useSearch();
  const { getTotalItems, cart } = useCart();

  // Detectar cambios en el carrito para animar
  useEffect(() => {
    const currentCount = getTotalItems();
    if (currentCount > cartItemCount && cartItemCount >= 0) {
      // Animar cuando el carrito aumenta
      setCartAnimation(true);
      setTimeout(() => setCartAnimation(false), 600);
    }
    setCartItemCount(currentCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const INSTAGRAM_URL = "https://www.instagram.com/thespanishgipsoteca/";

  // Debug: ver cuando cambia cartOpen
  useEffect(() => {
    console.log('Header - cartOpen cambió a:', cartOpen);
  }, [cartOpen]);

  return (
    <>
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal />
      <CartSidebar isOpen={cartOpen} onClose={() => {
        console.log('Cerrando carrito');
        setCartOpen(false);
      }} />
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-3 items-center py-3 sm:py-4">
            {/* Botón menú izquierda */}
            <div className="flex justify-start">
              <button
                onClick={() => setMenuOpen(true)}
                className="text-white transition-colors hover:text-accent"
                aria-label="Menu"
              >
                <MenuIcon />
              </button>
            </div>
            
            {/* Título centrado */}
            <div className="flex justify-center">
              <Link 
                to="/" 
                className="font-display text-xs uppercase tracking-[0.2em] text-white sm:text-sm sm:tracking-[0.3em] md:text-base md:tracking-[0.35em] lg:text-lg flex-shrink-0 px-5 py-2.5 text-center relative group transition-all"
              >
                <span className="hidden sm:inline relative z-10 block px-2">THE SPANISH GIPSOTECA</span>
                <span className="sm:hidden relative z-10 block px-2">TSG</span>
                {/* Borde decorativo sutil */}
                <span className="absolute inset-0 border border-white/10 transition-all duration-300 group-hover:border-white/30 hidden sm:block"></span>
                {/* Líneas decorativas en las esquinas */}
                <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-white/20 transition-all duration-300 group-hover:border-white/40 hidden sm:block"></span>
                <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-white/20 transition-all duration-300 group-hover:border-white/40 hidden sm:block"></span>
                <span className="absolute left-0 bottom-0 h-3 w-3 border-l border-b border-white/20 transition-all duration-300 group-hover:border-white/40 hidden sm:block"></span>
                <span className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-white/20 transition-all duration-300 group-hover:border-white/40 hidden sm:block"></span>
              </Link>
            </div>
            
            {/* Botones derecha */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-accent"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <button
                onClick={openSearch}
                className="text-white transition-colors hover:text-accent relative"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('CLICK EN CARRITO - Abriendo carrito, total items:', getTotalItems());
                  console.log('CLICK EN CARRITO - cartOpen antes:', cartOpen);
                  setCartOpen(true);
                  console.log('CLICK EN CARRITO - cartOpen después de setCartOpen(true)');
                }}
                className="text-white transition-colors hover:text-accent relative cursor-pointer"
                aria-label="Cart"
              >
                <BagIcon />
                {getTotalItems() > 0 && (
                  <span className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-black z-50 transition-transform ${
                    cartAnimation ? 'animate-bounce scale-125' : ''
                  }`}>
                    {getTotalItems() > 9 ? '9+' : getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
