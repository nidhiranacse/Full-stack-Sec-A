import React, { useState } from 'react';

/**
 * Practical B2: Shopping Cart with Discount Component
 *
 * @param {Object} props
 * @param {Array<{ id: number|string, name: string, price: number }>} props.products
 */
export default function Cart({ products = [] }) {
  const [cart, setCart] = useState([]);

  // Add product to cart (or increment quantity if already present)
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Increase quantity of a cart line
  const handleIncrease = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity of a cart line (removes item when quantity reaches 0)
  const handleDecrease = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove a line completely from cart
  const handleRemove = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Calculations
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isDiscountApplicable = total >= 1000;
  const discount = isDiscountApplicable ? total * 0.1 : 0;
  const grandTotal = total - discount;

  return (
    <div className="shopping-cart-container">
      {/* Products Section */}
      <section className="products-section">
        <h2>Available Products</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="product-price">₹{product.price.toFixed(2)}</span>
              </div>
              <button
                data-testid={`add-${product.id}`}
                className="btn btn-add"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Section */}
      <section className="cart-section">
        <h2>Your Shopping Cart</h2>

        {cart.length === 0 ? (
          <div data-testid="cart-empty" className="cart-empty">
            Cart is empty
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-line">
                <div className="cart-line-info">
                  <span className="cart-line-name">{item.name}</span>
                  <span className="cart-line-price">
                    ₹{item.price.toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="cart-line-actions">
                  <button
                    data-testid={`dec-${item.id}`}
                    className="btn btn-qty btn-dec"
                    onClick={() => handleDecrease(item.id)}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    -
                  </button>
                  <span data-testid={`qty-${item.id}`} className="cart-qty">
                    {item.quantity}
                  </span>
                  <button
                    data-testid={`inc-${item.id}`}
                    className="btn btn-qty btn-inc"
                    onClick={() => handleIncrease(item.id)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    data-testid={`remove-${item.id}`}
                    className="btn btn-remove"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        <div className="cart-summary">
          <div data-testid="total" className="summary-line total-line">
            Total: {total.toFixed(2)}
          </div>

          {isDiscountApplicable && (
            <div className="discount-block">
              <div data-testid="discount" className="summary-line discount-line">
                Discount: {discount.toFixed(2)}
              </div>
              <div data-testid="grand-total" className="summary-line grand-total-line">
                Grand Total: {grandTotal.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
