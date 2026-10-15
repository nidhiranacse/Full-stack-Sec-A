import React from 'react';
import { useStore } from '../context/StoreContext.jsx';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCartPrice,
    totalCartItems,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <aside className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3>Your Shopping Cart</h3>
            <span className="items-chip">{totalCartItems} items</span>
          </div>
          <button
            className="btn-close-drawer"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="drawer-empty-state">
            <span className="cart-empty-icon">🛒</span>
            <h4>Your cart is empty</h4>
            <p>Explore our high-performance hardware and developer tools to add items.</p>
          </div>
        ) : (
          <>
            <ul className="cart-items-list">
              {cart.map((item) => (
                <li key={item.id} className="cart-row-item">
                  <img src={item.image} alt={item.name} className="cart-thumb" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-unit-price">${item.price} each</span>
                    <div className="cart-qty-counter">
                      <button
                        className="btn-qty"
                        onClick={() => updateQuantity(item.id, -1)}
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button
                        className="btn-qty"
                        onClick={() => updateQuantity(item.id, 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-subtotal">
                    <span className="subtotal-amount">${item.price * item.quantity}</span>
                    <button
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="drawer-footer-summary">
              <div className="total-row">
                <span className="total-label">Subtotal:</span>
                <span className="total-value">${totalCartPrice.toLocaleString()}</span>
              </div>
              <p className="shipping-note">Free worldwide expedited shipping for developers.</p>

              <button
                className="btn-checkout-sim"
                onClick={() => alert('Order Placed Successfully! (Simulation)')}
              >
                Proceed to Checkout &rarr;
              </button>

              <button className="btn-clear-cart" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
