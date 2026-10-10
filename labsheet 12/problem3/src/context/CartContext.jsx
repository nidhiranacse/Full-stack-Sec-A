// ─── Cart Context & Reducer ─────────────────────────────────────────
// Manages cart state with useReducer + Context.
// Persists cart to localStorage so it survives page refresh.

import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

// ── Reducer Actions ─────────────────────────────────────────────────
function cartReducer(state, action) {
  let newState;

  switch (action.type) {
    case 'ADD': {
      const existing = state.find((item) => item.id === action.product.id);
      if (existing) {
        newState = state.map((item) =>
          item.id === action.product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        newState = [...state, { ...action.product, qty: 1 }];
      }
      break;
    }

    case 'INC':
      newState = state.map((item) =>
        item.id === action.id ? { ...item, qty: item.qty + 1 } : item
      );
      break;

    case 'DEC':
      newState = state
        .map((item) =>
          item.id === action.id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0);   // qty 0 → remove
      break;

    case 'REMOVE':
      newState = state.filter((item) => item.id !== action.id);
      break;

    default:
      return state;
  }

  // Persist to localStorage
  localStorage.setItem('cart', JSON.stringify(newState));
  return newState;
}

// ── Lazy initialiser (reads from localStorage) ─────────────────────
function initCart() {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ── Provider ────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], initCart);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// ── Custom hook for consuming the context ───────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
