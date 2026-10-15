import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Cart() {
  const { items, totalItems, totalPrice, dispatch } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating cart toggle button */}
      <button className="cart-toggle" onClick={() => setOpen((o) => !o)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </button>

      {/* Slide-out cart panel */}
      <div className={`cart-panel ${open ? "cart-open" : ""}`}>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="cart-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span>🛒</span>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <span className="cart-item-emoji">{item.image}</span>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">
                    ${item.price.toFixed(2)} × {item.qty}
                  </p>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => dispatch({ type: "DECREMENT", id: item.id })}
                  >
                    −
                  </button>
                  <span className="qty-value">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => dispatch({ type: "INCREMENT", id: item.id })}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-footer">
          <div className="cart-total" data-testid="cart-total">
            Total: <strong>${totalPrice.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && <div className="cart-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
}
