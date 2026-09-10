import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart((currentCart) => [
            ...currentCart,
            product
        ]);
    };

    const removeFromCart = (id) => {
        setCart((currentCart) =>
            currentCart.filter(item => item.id !== id)
        );
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}