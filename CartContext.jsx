import { createContext, useContext, useEffect, useReducer } from 'react';

const KEY = 'cart-v1';
const CartContext = createContext(null);

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { id, name, price } = action.product;
      const existing = state.find((i) => i.id === id);
      return existing
        ? state.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        : [...state, { id, name, price, qty: 1 }];
    }
    case 'INC':
      return state.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i));
    case 'DEC':   // qty reaching 0 removes the item
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id);
    default:
      return state;
  }
}

// Lazy initial state from localStorage (guarded: storage can be empty, blocked or corrupt)
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* ignore quota/blocked errors */ }
  }, [cart]);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  return <CartContext.Provider value={{ cart, dispatch, total }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
