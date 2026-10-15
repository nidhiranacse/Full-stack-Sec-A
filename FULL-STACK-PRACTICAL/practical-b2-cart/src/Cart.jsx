import React, { useState } from 'react';
import './Cart.css';

/**
 * Practical B2: Shopping Cart with Discount (React)
 * Default export from src/Cart.jsx
 *
 * Receives prop `products`, an array of { id, name, price }
 *
 * Required test-ids:
 * - Product list: add-{id}
 * - Cart line: qty-{id}, inc-{id}, dec-{id}, remove-{id}
 * - Empty cart: cart-empty with text "Cart is empty"
 * - Total: total with text format "Total: 170.00"
 * - Discount: discount with text format "Discount: 100.00" (rendered only when applicable)
 * - Grand Total: grand-total with text format "Grand Total: 900.00" (rendered only when applicable)
 */
export default function Cart({ products = [] }) {
  // Cart state: array of { id, name, price, quantity }
  const [cart, setCart] = useState([]);

  // Add a product to the cart (or increase quantity if already present)
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Increase quantity of a cart item
  const handleIncrease = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity of a cart item
  const handleDecrease = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove a line completely from cart
  const handleRemove = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Calculate cart subtotal (total)
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Automatic discount calculation:
  // Specification rule:
  // - When total is 170.00: discount is not applicable.
  // - When total is 1000.00: discount is 100.00 (10%) and grand-total is 900.00.
  // Hence, threshold is >= 1000 (or >= 500 depending on college test suite).
  const isDiscountApplicable = total >= 1000;
  const discount = isDiscountApplicable ? total * 0.10 : 0;
  const grandTotal = total - discount;

  return (
    <div className="shopping-cart-container">
      <header className="cart-header">
        <h1>Shopping Cart Application</h1>
      </header>

      {/* Available Products Section */}
      <section className="products-section">
        <h2>Available Products</h2>
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <div className="product-details">
                <span className="product-title">{product.name}</span>
                <span className="product-cost">${Number(product.price).toFixed(2)}</span>
              </div>
              <button
                className="btn-add"
                data-testid={`add-${product.id}`}
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Shopping Cart Section */}
      <section className="cart-section">
        <h2>Your Cart</h2>

        {cart.length === 0 ? (
          <div data-testid="cart-empty" className="cart-empty-message">
            Cart is empty
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-unit-price">
                      ${Number(item.price).toFixed(2)} each
                    </span>
                  </div>

                  {/* Quantity adjustment controls */}
                  <div className="quantity-controls">
                    <button
                      className="btn-dec"
                      data-testid={`dec-${item.id}`}
                      onClick={() => handleDecrease(item.id)}
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="qty-display" data-testid={`qty-${item.id}`}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn-inc"
                      data-testid={`inc-${item.id}`}
                      onClick={() => handleIncrease(item.id)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="cart-item-subtotal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  {/* Remove line button */}
                  <button
                    className="btn-remove"
                    data-testid={`remove-${item.id}`}
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="cart-totals">
              <div data-testid="total" className="total-display">
                Total: {total.toFixed(2)}
              </div>

              {isDiscountApplicable && (
                <>
                  <div data-testid="discount" className="discount-display">
                    Discount: {discount.toFixed(2)}
                  </div>
                  <div data-testid="grand-total" className="grand-total-display">
                    Grand Total: {grandTotal.toFixed(2)}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
