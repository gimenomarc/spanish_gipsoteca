import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import OptimizedImage from './OptimizedImage';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  useEffect(() => {
    console.log('CartSidebar - isOpen:', isOpen);
    console.log('CartSidebar - cart:', cart);
  }, [isOpen, cart]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    console.log('CartSidebar no está abierto');
    return null;
  }

  console.log('CartSidebar renderizando, cart tiene', cart.length, 'items');

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className="fixed right-0 top-0 z-[60] h-full w-full max-w-md transform bg-black shadow-xl transition-transform sm:w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="font-display text-lg uppercase tracking-[0.15em] text-white">
              Carrito
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 transition-colors hover:text-white"
              aria-label="Cerrar carrito"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12">
                <p className="mb-4 text-white/70">Tu carrito está vacío</p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="rounded-sm border border-white/20 px-6 py-2 text-sm uppercase tracking-[0.15em] text-white transition-all hover:border-white/40 hover:bg-white/10"
                >
                  Explorar productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.categoryId}-${item.code}`}
                    className="flex gap-4 border-b border-white/10 pb-4"
                  >
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      <div className="aspect-[3/4] w-20">
                        {item.images && item.images.length > 0 ? (
                          <OptimizedImage
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full"
                            priority={false}
                            aspectRatio="3/4"
                            size="thumbnail"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black/50">
                            <svg className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info del producto */}
                    <div className="flex flex-1 flex-col">
                      <Link
                        to={`/product/${item.categoryId}/${item.code}`}
                        onClick={onClose}
                        className="mb-1 text-sm font-medium text-white hover:text-white/70"
                      >
                        {item.name}
                      </Link>
                      <p className="mb-2 text-xs text-white/50">Code: {item.code}</p>
                      <p className="mb-2 text-sm font-medium text-white">{item.price}</p>

                      {/* Controles de cantidad */}
                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center border border-white/20">
                          <button
                            onClick={() => updateQuantity(item.code, item.categoryId, item.quantity - 1)}
                            className="px-2 py-1 text-white transition hover:bg-white/10"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-sm text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.code, item.categoryId, item.quantity + 1)}
                            className="px-2 py-1 text-white transition hover:bg-white/10"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.code, item.categoryId)}
                          className="text-white/50 transition-colors hover:text-white"
                          aria-label="Eliminar producto"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con total y botón */}
          {cart.length > 0 && (
            <div className="border-t border-white/10 bg-black/50 px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.1em] text-white/70">Total</span>
                <span className="text-xl font-medium text-white">
                  {getTotalPrice().toFixed(2)}€
                </span>
              </div>
              <Link
                to="/checkout"
                onClick={onClose}
                className="block w-full rounded-sm bg-white px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90"
              >
                Tramitar Pedido
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
