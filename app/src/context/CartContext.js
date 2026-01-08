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

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('spanish_gipsoteca_cart');
    console.log('CartContext - Cargando carrito desde localStorage:', savedCart);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('CartContext - Carrito parseado:', parsedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      console.log('CartContext - No hay carrito guardado en localStorage');
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    console.log('CartContext - Guardando carrito en localStorage:', cart);
    if (cart.length > 0) {
      localStorage.setItem('spanish_gipsoteca_cart', JSON.stringify(cart));
      console.log('CartContext - Carrito guardado correctamente');
    } else {
      console.log('CartContext - Carrito vacío, no se guarda');
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    console.log('addToCart llamado con:', { product, quantity });
    
    if (!product) {
      console.error('Producto es null o undefined');
      return;
    }
    
    if (!product.code) {
      console.error('Producto no tiene code:', product);
      return;
    }
    
    if (!product.categoryId) {
      console.error('Producto no tiene categoryId:', product);
      return;
    }

    setCart((prevCart) => {
      console.log('Carrito anterior:', prevCart);
      const existingItem = prevCart.find(
        (item) => item.code === product.code && item.categoryId === product.categoryId
      );

      if (existingItem) {
        console.log('Producto ya existe, actualizando cantidad');
        const updatedCart = prevCart.map((item) =>
          item.code === product.code && item.categoryId === product.categoryId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log('Carrito actualizado:', updatedCart);
        return updatedCart;
      }

      console.log('Añadiendo nuevo producto al carrito');
      const newCart = [...prevCart, { ...product, quantity }];
      console.log('Nuevo carrito:', newCart);
      return newCart;
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

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('€', '').replace(',', '.')) || 0;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
