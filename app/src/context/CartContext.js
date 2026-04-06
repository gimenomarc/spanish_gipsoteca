import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('spanish_gipsoteca_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        // carrito corrupto, ignorar
      }
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('spanish_gipsoteca_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    if (!product?.code || !product?.categoryId) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.code === product.code && item.categoryId === product.categoryId
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.code === product.code && item.categoryId === product.categoryId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productCode, categoryId) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.code === productCode && item.categoryId === categoryId)
      )
    );
  };

  const updateQuantity = (productCode, categoryId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productCode, categoryId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.code === productCode && item.categoryId === categoryId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('spanish_gipsoteca_cart');
  };

  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('€', '').replace(',', '.')) || 0;
      return total + price * item.quantity;
    }, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}
