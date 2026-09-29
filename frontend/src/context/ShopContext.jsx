import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ShopContext = createContext(null);
const CART_KEY = "collector-cart";
const FAVORITES_KEY = "collector-favorites";

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)), [favorites]);

  function addToCart(product) {
    setCart((current) => current.some((item) => item.id === product.id) ? current : [...current, product]);
  }

  function removeFromCart(productId) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  function toggleFavorite(product) {
    setFavorites((current) => current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, product]);
  }

  const value = useMemo(() => ({
    cart,
    favorites,
    cartCount: cart.length,
    cartTotal: cart.reduce((total, item) => total + Number(item.price || 0), 0),
    addToCart,
    removeFromCart,
    toggleFavorite,
    isFavorite: (productId) => favorites.some((item) => item.id === productId),
  }), [cart, favorites]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  return useContext(ShopContext);
}
