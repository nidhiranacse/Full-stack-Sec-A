import { createContext, useContext, useState } from 'react'

/* ========================
   Cart Context
   - Global state using Context API
   - Provides cart items + add/remove functions
   ======================== */

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  // Add item to cart
  const addToCart = (product) => {
    setCart((prev) => {
      // Check if already in cart
      const exists = prev.find((item) => item.id === product.id)
      if (exists) return prev
      return [...prev, product]
    })
  }

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // Check if item is in cart
  const isInCart = (id) => {
    return cart.some((item) => item.id === id)
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook for using cart context
export function useCart() {
  return useContext(CartContext)
}
