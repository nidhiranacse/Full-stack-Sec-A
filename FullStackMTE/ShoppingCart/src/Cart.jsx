
import React, { useState } from "react";
import "./Cart.css";

export default function Cart({ products = [] }) {
  const [cart, setCart] = useState({});

  const addToCart = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }));
  };

  const changeQuantity = (id, amount) => {
    setCart((prev) => {
      const quantity = prev[id].quantity + amount;
      if (quantity <= 0) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return {
        ...prev,
        [id]: { ...prev[id], quantity },
      };
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const items = Object.values(cart);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = total >= 1000 ? total * 0.1 : 0;
  const grandTotal = total - discount;

  return (
    <div className="shopping-page">
      <header className="shop-header">
        <div className="shop-logo"> Blush & Bloom</div>
        <p>Your little corner of happiness</p>
      </header>

      <main className="shop-container">
        <section className="products-section">
          <h1>Lovely Finds</h1>
          <p className="section-subtitle">A little something just for you </p>

          <div className="products-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-icon">*</div>
                <h3>{product.name}</h3>
                <p className="product-price">
                  ₹{Number(product.price).toFixed(2)}
                </p>
                <button
                  className="add-button"
                  data-testid={`add-${product.id}`}
                  onClick={() => addToCart(product)}
                >
                  + Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="cart-section">
          <h2>Your Shopping Bag</h2>
          <p className="section-subtitle">Your favourites, all in one place</p>

          {items.length === 0 ? (
            <div className="empty-cart" data-testid="cart-empty">
              <span className="empty-heart">*</span>
              <p>Cart is empty</p>
              <small>Find something lovely to add!</small>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>₹{Number(item.price).toFixed(2)} each</p>
                    <p className="item-subtotal">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="quantity-controls">
                    <button
                      data-testid={`dec-${item.id}`}
                      onClick={() => changeQuantity(item.id, -1)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>
                    <span data-testid={`qty-${item.id}`}>
                      {item.quantity}
                    </span>
                    <button
                      data-testid={`inc-${item.id}`}
                      onClick={() => changeQuantity(item.id, 1)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-button"
                    data-testid={`remove-${item.id}`}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bill-card">
            <div className="bill-row">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="bill-row" data-testid="total">
              <span>Total:</span>
              <span>{total.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <>
                <div className="bill-row discount-row" data-testid="discount">
                  <span>Discount:</span>
                  <span>{discount.toFixed(2)}</span>
                </div>

                <div
                  className="bill-row grand-total"
                  data-testid="grand-total"
                >
                  <span>Grand Total:</span>
                  <span>{grandTotal.toFixed(2)}</span>
                </div>
              </>
            )}

            <p className="discount-note">
              {total < 1000
                ? `Spend ₹${(1000 - total).toFixed(2)} more for 10% off!`
                : "Yay! You've unlocked your 10% discount!"}
            </p>
          </div>

          <button
            className="checkout-button"
            disabled={items.length === 0}
          >
            ~~Continue to Checkout~~
          </button>
        </section>
      </main>

      <footer className="shop-footer">
        Made with love  ~Blush & Bloom~
      </footer>
    </div>
  );
}
