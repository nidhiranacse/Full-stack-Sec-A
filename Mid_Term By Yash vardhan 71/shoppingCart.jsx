import { useState } from 'react';

export default function Cart({ products }) {
    const [cart, setCart] = useState([]);

    const addProduct = (product) => {
        setCart((items) => {
            const existing = items.find((item) => item.id === product.id);

            if (existing) {
                return items.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...items, { ...product, quantity: 1 }];
        });
    };

    const increase = (id) => {
        setCart((items) =>
            items.map((item) =>
                item.id === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decrease = (id) => {
        setCart((items) =>
            items
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeProduct = (id) => {
        setCart((items) => items.filter((item) => item.id !== id));
    };

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const discount = total >= 1000 ? total * 0.1 : 0;
    const grandTotal = total - discount;

    return (
        <div>
            <h2>Shopping Cart</h2>

            <h3>Products</h3>

            {products.map((product) => (
                <div key={product.id}>
                    <span>{product.name} - {product.price.toFixed(2)} </span>
                    <button
                        data-testid={`add-${product.id}`}
                        onClick={() => addProduct(product)}
                    >
                        Add
                    </button>
                </div>
            ))}

            <h3>Cart Items</h3>

            {cart.length === 0 ? (
                <p data-testid="cart-empty">Cart is empty</p>
            ) : (
                cart.map((item) => (
                    <div key={item.id}>
                        <p>{item.name} - {item.price.toFixed(2)}</p>

                        <span data-testid={`qty-${item.id}`}>
                            {item.quantity}
                        </span>

                        <button
                            data-testid={`inc-${item.id}`}
                            onClick={() => increase(item.id)}
                        >
                            +
                        </button>

                        <button
                            data-testid={`dec-${item.id}`}
                            onClick={() => decrease(item.id)}
                        >
                            -
                        </button>

                        <button
                            data-testid={`remove-${item.id}`}
                            onClick={() => removeProduct(item.id)}
                        >
                            Remove
                        </button>
                    </div>
                ))
            )}

            <p data-testid="total">Total: {total.toFixed(2)}</p>

            {discount > 0 && (
                <>
                    <p data-testid="discount">
                        Discount: {discount.toFixed(2)}
                    </p>

                    <p data-testid="grand-total">
                        Grand Total: {grandTotal.toFixed(2)}
                    </p>
                </>
            )}
        </div>
    );
}
