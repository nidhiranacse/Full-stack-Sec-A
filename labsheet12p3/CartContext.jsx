import React, {
  createContext,
  useContext,
  useReducer
} from "react";

const CartContext = createContext();

function getInitialCart() {
  try {
    const saved = localStorage.getItem("cart");

    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function cartReducer(state, action) {
  let newState = { ...state };

  switch (action.type) {
    case "ADD": {
      const product = action.product;

      if (newState[product.id]) {
        newState[product.id] = {
          ...newState[product.id],
          quantity:
            newState[product.id].quantity + 1
        };
      } else {
        newState[product.id] = {
          ...product,
          quantity: 1
        };
      }

      return newState;
    }

    case "INC": {
      const item = newState[action.id];

      if (!item) return state;

      newState[action.id] = {
        ...item,
        quantity: item.quantity + 1
      };

      return newState;
    }

    case "DEC": {
      const item = newState[action.id];

      if (!item) return state;

      if (item.quantity <= 1) {
        delete newState[action.id];
      } else {
        newState[action.id] = {
          ...item,
          quantity: item.quantity - 1
        };
      }

      return newState;
    }

    case "REMOVE": {
      delete newState[action.id];

      return newState;
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    undefined,
    getInitialCart
  );

  React.useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  const total = Object.values(cart).reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        dispatch,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}