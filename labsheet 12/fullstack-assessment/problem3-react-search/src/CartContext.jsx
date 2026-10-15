import { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((item) => item.id === action.product.id);

      if (existing) {
        return state.map((item) =>
          item.id === action.product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...state, { ...action.product, qty: 1 }];
    }

    case "INC":
      return state.map((item) =>
        item.id === action.id
          ? { ...item, qty: item.qty + 1 }
          : item
      );

    case "DEC":
      return state
        .map((item) =>
          item.id === action.id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0);

    case "REMOVE":
      return state.filter((item) => item.id !== action.id);

    default:
      return state;
  }
}

function getInitialCart() {
  try {
    const saved = localStorage.getItem("cart");

    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, [], getInitialCart);

  const addToCart = (product) => {
    dispatch({
      type: "ADD",
      product,
    });
  };

  const increment = (id) => {
    dispatch({
      type: "INC",
      id,
    });
  };

  const decrement = (id) => {
    dispatch({
      type: "DEC",
      id,
    });
  };

  const remove = (id) => {
    dispatch({
      type: "REMOVE",
      id,
    });
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increment,
        decrement,
        remove,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}