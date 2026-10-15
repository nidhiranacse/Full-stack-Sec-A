/**
 * Cart Context & Reducer
 * BTCS303T Full Stack | Coding Assessment - Problem 3
 * 
 * Hard Requirements:
 * - State management: cart logic must use useReducer together with Context. Prop drilling is not accepted.
 * - Actions: ADD, INC, DEC, REMOVE (quantity 0 removes item).
 * - Persistence: cart survives page refresh using localStorage (lazy initial state).
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'btcs303t_cart_state';

// Action Types
export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  INCREMENT_QTY: 'INCREMENT_QTY',
  DECREMENT_QTY: 'DECREMENT_QTY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART'
};

// Lazy Initial State from localStorage
function getInitialState() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
  }
  return [];
}

// Reducer function
export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const product = action.payload;
      const existingIndex = state.findIndex(item => item.id === product.id);

      if (existingIndex > -1) {
        // Increment quantity of existing item
        return state.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new item with quantity 1
      return [...state, { ...product, quantity: 1 }];
    }

    case CART_ACTIONS.INCREMENT_QTY: {
      const productId = action.payload;
      return state.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    case CART_ACTIONS.DECREMENT_QTY: {
      const productId = action.payload;
      return state
        .map(item => {
          if (item.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter(item => item.quantity > 0); // Requirement: A quantity of 0 removes the item
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      return state.filter(item => item.id !== productId);
    }

    case CART_ACTIONS.CLEAR_CART:
      return [];

    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], getInitialState);

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error writing cart to localStorage:', error);
    }
  }, [cart]);

  // Derived values
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Action Dispatchers
  const addToCart = (product) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: product });
  };

  const incrementQty = (productId) => {
    dispatch({ type: CART_ACTIONS.INCREMENT_QTY, payload: productId });
  };

  const decrementQty = (productId) => {
    dispatch({ type: CART_ACTIONS.DECREMENT_QTY, payload: productId });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const value = {
    cart,
    cartTotal,
    totalItemCount,
    addToCart,
    incrementQty,
    decrementQty,
    removeFromCart,
    clearCart,
    dispatch
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
