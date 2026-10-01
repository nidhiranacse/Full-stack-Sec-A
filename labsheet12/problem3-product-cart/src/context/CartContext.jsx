import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

const CartContext = createContext(null);

const initialState = {
  items: {},
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const product = action.payload;
      const existingItem = state.items[product.id];

      return {
        ...state,
        items: {
          ...state.items,
          [product.id]: existingItem
            ? {
                ...existingItem,
                quantity: existingItem.quantity + 1,
              }
            : {
                ...product,
                quantity: 1,
              },
        },
      };
    }

    case "INCREMENT": {
      const item = state.items[action.payload];

      if (!item) {
        return state;
      }

      return {
        ...state,
        items: {
          ...state.items,
          [action.payload]: {
            ...item,
            quantity: item.quantity + 1,
          },
        },
      };
    }

    case "DECREMENT": {
      const item = state.items[action.payload];

      if (!item) {
        return state;
      }

      if (item.quantity <= 1) {
        const updatedItems = { ...state.items };
        delete updatedItems[action.payload];

        return {
          ...state,
          items: updatedItems,
        };
      }

      return {
        ...state,
        items: {
          ...state.items,
          [action.payload]: {
            ...item,
            quantity: item.quantity - 1,
          },
        },
      };
    }

    default:
      return state;
  }
}

function getInitialState() {
  try {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      return initialState;
    }

    return {
      items: JSON.parse(savedCart),
    };
  } catch {
    return initialState;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    getInitialState
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const cartItems = Object.values(state.items);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: cartItems,
        total,
        dispatch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}