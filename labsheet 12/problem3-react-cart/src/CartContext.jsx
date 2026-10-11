import { createContext, useContext, useEffect, useReducer } from 'react';

const STORAGE_KEY = 'cart-v1';
const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const p = action.product;
      const exists = state.some((i) => i.id === p.id);
      return exists
        ? state.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    }
    case 'INC':
      return state.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i));
    case 'DEC':
      // quantity reaching 0 removes the item
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id);
    default:
      return state;
  }
}

// lazy initial state read from localStorage (survives refresh)
function init() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], init);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* storage unavailable: ignore */ }
  }, [items]);

  const total = Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;

  return (
    <CartContext.Provider value={{ items, total, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
