import React, { useState } from 'react';
import './Cart.css';

// Discount rule: 10% off when the cart total is 1000.00 or more.
const DISCOUNT_THRESHOLD = 1000;
const DISCOUNT_RATE = 0.1;

export default function Cart({ products = [] }) {
  // cart: array of { id, qty }
  const [cart, setCart] = useState([]);

  const addProduct = (id) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) {
        return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { id, qty: 1 }];
    });
  };

  const increase = (id) =>
    setCart((prev) => prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)));

  // Quantity never drops below 1; use the remove button to delete a line.
  const decrease = (id) =>
    setCart((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty - 1) } : l))
    );

  const remove = (id) => setCart((prev) => prev.filter((l) => l.id !== id));

  const lines = cart
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.id) }))
    .filter((l) => l.product);

  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const hasDiscount = total >= DISCOUNT_THRESHOLD;
  const discount = hasDiscount ? total * DISCOUNT_RATE : 0;
  const grandTotal = total - discount;

  return (
    <div className="shop">
      <h1 className="shop-title">Shopping Cart</h1>

      <div className="shop-grid">
        <section className="panel">
          <h2>Products</h2>
          <ul className="list">
            {products.map((p) => (
              <li key={p.id} className="row">
                <div className="item-info">
                  <span className="item-name">{p.name}</span>
                  <span className="item-price">{p.price.toFixed(2)}</span>
                </div>
                <button
                  className="btn btn-primary"
                  data-testid={`add-${p.id}`}
                  onClick={() => addProduct(p.id)}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Cart</h2>
          {lines.length === 0 ? (
            <p className="empty" data-testid="cart-empty">Cart is empty</p>
          ) : (
            <ul className="list">
              {lines.map((l) => (
                <li key={l.id} className="row">
                  <span className="item-name">{l.product.name}</span>
                  <div className="controls">
                    <div className="qty-box">
                      <button
                        className="btn btn-icon"
                        data-testid={`dec-${l.id}`}
                        onClick={() => decrease(l.id)}
                      >
                        -
                      </button>
                      <span className="qty" data-testid={`qty-${l.id}`}>{l.qty}</span>
                      <button
                        className="btn btn-icon"
                        data-testid={`inc-${l.id}`}
                        onClick={() => increase(l.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn btn-danger"
                      data-testid={`remove-${l.id}`}
                      onClick={() => remove(l.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="summary">
            <p className="line" data-testid="total">Total: {total.toFixed(2)}</p>
            {hasDiscount && (
              <>
                <p className="line discount" data-testid="discount">
                  Discount: {discount.toFixed(2)}
                </p>
                <p className="line grand" data-testid="grand-total">
                  Grand Total: {grandTotal.toFixed(2)}
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}