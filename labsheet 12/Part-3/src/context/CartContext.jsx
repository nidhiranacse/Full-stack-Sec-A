import { createContext, useContext, useReducer, useEffect } from "react";

/* ─── helpers ───────────────────────────────────────────── */
const STORAGE_KEY = "product-search-cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ─── reducer ───────────────────────────────────────────── */
function cartReducer(state, action) {
  let next;

  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((i) => i.id === action.product.id);
      if (existing) {
        next = state.map((i) =>
          i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        next = [...state, { ...action.product, qty: 1 }];
      }
      break;
    }

    case "INCREMENT": {
      next = state.map((i) =>
        i.id === action.id ? { ...i, qty: i.qty + 1 } : i
      );
      break;
    }

    case "DECREMENT": {
      next = state
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0); // auto-remove at 0
      break;
    }

    default:
      return state;
  }

  persistCart(next);
  return next;
}

/* ─── context ───────────────────────────────────────────── */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, null, loadCart);

  // Compute totals
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
