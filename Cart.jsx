import React, { useState } from "react";
import "./App.css";

export default function Cart({ products = [] }) {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  function addToCart(product) {
    setCart((oldCart) => {
      const existing = oldCart.find((item) => item.id === product.id);

      if (existing) {
        return oldCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...oldCart, { ...product, quantity: 1 }];
    });

    setMessage(`${product.name} added to cart!`);
    setTimeout(() => setMessage(""), 2000);
  }

  function increase(id) {
    setCart((old) =>
      old.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decrease(id) {
    setCart((old) =>
      old
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id) {
    setCart((old) => old.filter((item) => item.id !== id));
    setMessage("Product removed from cart.");
    setTimeout(() => setMessage(""), 2000);
  }

  function clearCart() {
    setCart([]);
    setMessage("Cart cleared successfully.");
    setTimeout(() => setMessage(""), 2000);
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 10% discount for totals of ₹1,000 or more
  const discount = total >= 1000 ? total * 0.1 : 0;
  const grandTotal = total - discount;
  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  function checkout() {
    if (cart.length === 0) {
      setMessage("Please add a product before checkout.");
    } else {
      setMessage(
        `Order placed successfully! Total: ₹${grandTotal.toFixed(2)}`
      );
    }
  }

  return (
    <div className="shop-page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🛍️</div>
          <div>
            <h1>ShopEase</h1>
            <p>Better Products. Better Life.</p>
          </div>
        </div>

        <div className="cart-indicator">
          🛒 <span>{itemCount}</span>
        </div>
      </header>

      {message && (
        <div className="toast" role="status">
          ✨ {message}
        </div>
      )}

      <section className="hero">
        <div className="hero-icon">🎁</div>
        <div>
          <h2>Shopping made delightful!</h2>
          <p>Discover your favorites and enjoy exclusive discounts.</p>
        </div>
      </section>

      <main className="shop-layout">
        <section className="products-section">
          <div className="section-heading">
            <h2>Explore Products</h2>
            <span>{products.length} products</span>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <span>{product.emoji || "🛍️"}</span>
                  )}
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">
                    ₹{Number(product.price).toFixed(2)}
                  </p>
                  <p className="description">
                    {product.description || "A great choice for everyday use."}
                  </p>

                  <button
                    className="add-button"
                    data-testid={`add-${product.id}`}
                    onClick={() => addToCart(product)}
                  >
                    + Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="cart-panel">
          <div className="section-heading cart-heading">
            <h2>🛒 Your Cart</h2>
            <span>{itemCount} items</span>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart" data-testid="cart-empty">
              <div className="empty-icon">🛍️</div>
              <h3>Your cart is empty</h3>
              <p>Add something you love to get started!</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-product-icon">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      item.emoji || "📦"
                    )}
                  </div>

                  <div className="cart-product-info">
                    <h4>{item.name}</h4>
                    <p className="price">
                      ₹{Number(item.price).toFixed(2)}
                    </p>

                    <div className="quantity-control">
                      <button
                        data-testid={`dec-${item.id}`}
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => decrease(item.id)}
                      >
                        −
                      </button>

                      <span data-testid={`qty-${item.id}`}>
                        {item.quantity}
                      </span>

                      <button
                        data-testid={`inc-${item.id}`}
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => increase(item.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <strong>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </strong>
                    <button
                      className="remove-button"
                      data-testid={`remove-${item.id}`}
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bill">
            <div className="bill-row">
              <span>Subtotal</span>
              <strong data-testid="total">₹{total.toFixed(2)}</strong>
            </div>

            {discount > 0 && (
              <div className="bill-row discount-row">
                <span>Discount (10%)</span>
                <strong data-testid="discount">
                  − ₹{discount.toFixed(2)}
                </strong>
              </div>
            )}

            <div className="grand-total">
              <span>Grand Total</span>
              <strong data-testid="grand-total">
                ₹{grandTotal.toFixed(2)}
              </strong>
            </div>

            <button className="checkout-button" onClick={checkout}>
              Proceed to Checkout →
            </button>

            <button className="clear-button" onClick={clearCart}>
              Clear Cart
            </button>
          </div>

          <p className="secure-note">🔒 Secure and easy shopping</p>
        </aside>
      </main>

      <footer className="footer">
        🚚 Free shipping on orders above ₹1,000
        <span>•</span>
        💳 Secure payments
        <span>•</span>
        💙 Happy Shopping!
      </footer>
    </div>
  );
}