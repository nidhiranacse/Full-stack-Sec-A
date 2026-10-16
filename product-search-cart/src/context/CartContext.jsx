import { createContext, useContext, useEffect, useReducer } from "react";

const CartContext = createContext(null);

const initialState = {
  cart: []
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.cart.find(
        (item) => item.id === action.product.id
      );

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      return {
        ...state,
        cart: [
          ...state.cart,
          {
            ...action.product,
            quantity: 1
          }
        ]
      };
    }

    case "INCREMENT":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };

    case "DECREMENT":
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.id === action.id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0)
      };

    case "REMOVE":
      return {
        ...state,
        cart: state.cart.filter(
          (item) => item.id !== action.id
        )
      };

    default:
      return state;
  }
}

function getInitialCart() {
  try {
    const savedCart = localStorage.getItem("shopping-cart");

    if (savedCart) {
      return {
        cart: JSON.parse(savedCart)
      };
    }
  } catch (error) {
    console.error("Could not load cart:", error);
  }

  return initialState;
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    getInitialCart
  );

  useEffect(() => {
    localStorage.setItem(
      "shopping-cart",
      JSON.stringify(state.cart)
    );
  }, [state.cart]);

  const addToCart = (product) =>
    dispatch({
      type: "ADD_TO_CART",
      product
    });

  const increment = (id) =>
    dispatch({
      type: "INCREMENT",
      id
    });

  const decrement = (id) =>
    dispatch({
      type: "DECREMENT",
      id
    });

  const remove = (id) =>
    dispatch({
      type: "REMOVE",
      id
    });

  const totalQuantity = state.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        addToCart,
        increment,
        decrement,
        remove,
        totalQuantity,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
