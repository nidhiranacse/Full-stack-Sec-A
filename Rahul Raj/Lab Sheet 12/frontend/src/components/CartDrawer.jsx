/**
 * Cart Drawer & Summary Component
 * BTCS303T Full Stack | Coding Assessment - Problem 3
 * 
 * Test Hook:
 * - data-testid="cart-total"
 */

import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, cartTotal, totalItemCount, incrementQty, decrementQty, removeFromCart, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} className="cart-icon" />
            <h2>Shopping Cart ({totalItemCount})</h2>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <span className="empty-cart-icon">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Search products and click "Add to Cart" to start filling your order.</p>
            </div>
          ) : (
            <ul className="cart-list">
              {cart.map(item => (
                <li key={item.id} className="cart-item-row">
                  <span className="cart-item-img">{item.image}</span>
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{item.name}</h4>
                    <span className="cart-item-price">${item.price.toFixed(2)} each</span>
                  </div>

                  <div className="cart-item-controls">
                    <button
                      type="button"
                      className="qty-btn dec-cart-btn"
                      onClick={() => decrementQty(item.id)}
                      title="Decrement quantity"
                      aria-label="Decrement quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn inc-cart-btn"
                      onClick={() => incrementQty(item.id)}
                      title="Increment quantity"
                      aria-label="Increment quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-trash"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Subtotal:</span>
              <span className="cart-total-price" data-testid="cart-total">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <div className="cart-footer-actions">
              <button
                type="button"
                className="btn-clear-cart"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button
                type="button"
                className="btn-checkout"
                onClick={() => alert(`Order placed successfully! Total: $${cartTotal.toFixed(2)}`)}
              >
                <span>Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
