
import React, { useState } from "react";

export default function Cart({ products }) {
  const [cart, setCart] = useState({});

  // Add product to cart
  const addToCart = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
  };

  // Increase quantity
  const increase = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: prev[id] + 1
    }));
  };

  // Decrease quantity
  const decrease = (id) => {
    setCart((prev) => {
      if (prev[id] <= 1) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }

      return { ...prev, [id]: prev[id] - 1 };
    });
  };

  // Remove product
  const remove = (id) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const cartProducts = products.filter(
    (product) => cart[product.id] > 0
  );

  const total = cartProducts.reduce(
    (sum, product) =>
      sum + product.price * cart[product.id],
    0
  );

  // Apply 10% discount when total is 1000 or more
  const discount = total >= 1000 ? total * 0.1 : 0;
  const grandTotal = total - discount;

  return (
    <div>
      <h2>Shopping Cart</h2>

      <h3>Products</h3>

      {products.map((product) => (
        <div key={product.id}>
          <span>
            {product.name} - {product.price.toFixed(2)}
          </span>

          <button
            data-testid={`add-${product.id}`}
            onClick={() => addToCart(product)}
          >
            Add
          </button>
        </div>
      ))}

      <h3>Cart Items</h3>

      {cartProducts.length === 0 ? (
        <p data-testid="cart-empty">Cart is empty</p>
      ) : (
        cartProducts.map((product) => (
          <div key={product.id}>
            <span>{product.name} </span>

            <span data-testid={`qty-${product.id}`}>
              {cart[product.id]}
            </span>

            <button
              data-testid={`inc-${product.id}`}
              onClick={() => increase(product.id)}
            >
              +
            </button>

            <button
              data-testid={`dec-${product.id}`}
              onClick={() => decrease(product.id)}
            >
              -
            </button>

            <button
              data-testid={`remove-${product.id}`}
              onClick={() => remove(product.id)}
            >
              Remove
            </button>
          </div>
        ))
      )}

      <p data-testid="total">
        Total: {total.toFixed(2)}
      </p>

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
