import React, { useState } from 'react';
import './Cart.css';

const icons = ['⌨️', '🖱️', '🎧', '📱', '⌚', '💻'];

export default function Cart({ products = [] }) {
const [cart, setCart] = useState({});


const addItem = (product) => {
    setCart(prev => ({
        ...prev,
        [product.id]: {
            ...product,
            quantity: (prev[product.id]?.quantity || 0) + 1
        }
    }));
};

const increase = (id) => {
    setCart(prev => ({
        ...prev,
        [id]: { ...prev[id], quantity: prev[id].quantity + 1 }
    }));
};

const decrease = (id) => {
    setCart(prev => {
        if (prev[id].quantity <= 1) {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        }

        return {
            ...prev,
            [id]: { ...prev[id], quantity: prev[id].quantity - 1 }
        };
    });
};

const removeItem = (id) => {
    setCart(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
    });
};

const items = Object.values(cart);
const count = items.reduce((sum, item) => sum + item.quantity, 0);
const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
);

const discount = subtotal >= 1000 ? subtotal * 0.10 : 0;
const grandTotal = subtotal - discount;
const money = value => value.toFixed(2);

return (
    <main className="page">
        <header className="hero">
            <div className="hero-content">
                <div className="hero-icon">🛍️</div>
                <div>
                    <h1>Shopping Cart</h1>
                    <p>Discover your favourites. Enjoy every purchase.</p>
                </div>
            </div>
            <div className="cart-badge" title={`${count} items`}>
                🛒 {count}
            </div>
        </header>

        <section className="panel">
            <h2 className="section-title">
                <span className="section-icon">✦</span>
                Explore Products
            </h2>

            <div className="product-grid">
                {products.map((product, index) => (
                    <article className="product-card" key={product.id}>
                        <div className="product-emoji">
                            {icons[index % icons.length]}
                        </div>

                        <h3>{product.name}</h3>

                        <div className="product-price">
                            ₹{money(product.price)}
                        </div>

                        <button
                            className="add-button"
                            data-testid={`add-${product.id}`}
                            onClick={() => addItem(product)}
                        >
                            + Add to Cart
                        </button>
                    </article>
                ))}
            </div>
        </section>

        <div className="cart-layout">
            <section className="panel">
                <h2 className="section-title">
                    <span className="section-icon">🛒</span>
                    Your Cart
                </h2>

                {items.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛍️</div>
                        <p data-testid="cart-empty">Cart is empty</p>
                        <span>Add a product to get started.</span>
                    </div>
                ) : (
                    <div className="cart-list">
                        {items.map(item => (
                            <article className="cart-item" key={item.id}>
                                <div className="item-info">
                                    <div className="item-thumbnail">
                                        {icons[products.findIndex(
                                            p => p.id === item.id
                                        ) % icons.length] || '📦'}
                                    </div>

                                    <div>
                                        <div className="item-name">
                                            {item.name}
                                        </div>
                                        <div className="item-price">
                                            ₹{money(item.price)} each
                                        </div>
                                    </div>
                                </div>

                                <div className="item-actions">
                                    <div className="quantity-controls">
                                        <button
                                            className="quantity-button"
                                            data-testid={`dec-${item.id}`}
                                            aria-label={`Decrease ${item.name}`}
                                            onClick={() => decrease(item.id)}
                                        >
                                            −
                                        </button>

                                        <span
                                            className="quantity"
                                            data-testid={`qty-${item.id}`}
                                        >
                                            {item.quantity}
                                        </span>

                                        <button
                                            className="quantity-button"
                                            data-testid={`inc-${item.id}`}
                                            aria-label={`Increase ${item.name}`}
                                            onClick={() => increase(item.id)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        className="remove-button"
                                        data-testid={`remove-${item.id}`}
                                        aria-label={`Remove ${item.name}`}
                                        onClick={() => removeItem(item.id)}
                                    >
                                        🗑
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {discount > 0 && (
                    <div className="discount-note">
                        🎉 Great choice! Your order qualifies for a 10%
                        discount.
                    </div>
                )}
            </section>

            <aside className="panel summary">
                <h2 className="section-title">
                    <span className="section-icon">▤</span>
                    Order Summary
                </h2>

                <div className="summary-row">
                    <span>Items</span>
                    <strong>{count}</strong>
                </div>

                <div className="summary-row">
                    <span>Subtotal</span>
                    <strong>₹{money(subtotal)}</strong>
                </div>

                {discount > 0 && (
                    <div className="summary-row discount-row">
                        <span>Discount (10%)</span>
                        <strong data-testid="discount">
                            − ₹{money(discount)}
                        </strong>
                    </div>
                )}

                <div className="grand-total">
                    <span>{discount > 0 ? 'Grand Total' : 'Total'}</span>
                    <strong>
                        ₹{money(grandTotal)}
                    </strong>
                </div>

                {discount > 0 && (
                    <div data-testid="grand-total" hidden>
                        Grand Total: {money(grandTotal)}
                    </div>
                )}

                <div data-testid="total" hidden>
                    Total: {money(subtotal)}
                </div>

                <div className="discount-note">
                    💜 {discount > 0
                        ? `You saved ₹${money(discount)} on this order!`
                        : `Spend ₹${money(Math.max(0, 1000 - subtotal))} more to unlock 10% off.`}
                </div>
            </aside>
        </div>

        <footer className="savings-banner">
            <div>
                <div className="savings-title">
                    ✨ Smart shopping. Better savings.
                </div>
                <div className="savings-detail">
                    Your discount is calculated automatically.
                </div>
            </div>

            <div className="savings-amount">
                ₹{money(grandTotal)}
            </div>
        </footer>

        <footer className="footer">
            A little something for your everyday life · Happy shopping!
        </footer>
    </main>
);


}
