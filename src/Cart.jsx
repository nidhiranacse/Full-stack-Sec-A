
import { useState } from "react";

export default function Cart({ products = [] }) {
  const [cart, setCart] = useState({});

  function addProduct(product) {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  }

  function changeQuantity(id, amount) {
    setCart((prev) => {
      const updated = { ...prev };
      const quantity = (updated[id] || 0) + amount;

      if (quantity <= 0) {
        delete updated[id];
      } else {
        updated[id] = quantity;
      }

      return updated;
    });
  }

  function removeProduct(id) {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  const cartProducts = products.filter(
    (product) => (cart[product.id] || 0) > 0
  );

  const total = cartProducts.reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0
  );

  // Example discount: 10% when total is at least 1000
  const discount = total >= 1000 ? total * 0.1 : 0;
  const grandTotal = total - discount;

  return (
    <div>
      <h2>Shopping Cart</h2>

      <h3>Available Products</h3>

      {products.map((product) => (
        <div key={product.id}>
          <span>
            {product.name} - {Number(product.price).toFixed(2)}
          </span>{" "}
          <button
            data-testid={`add-${product.id}`}
            onClick={() => addProduct(product)}
          >
            Add to Cart
          </button>
        </div>
      ))}

      <h3>Your Cart</h3>

      {cartProducts.length === 0 ? (
        <p data-testid="cart-empty">Cart is empty</p>
      ) : (
        cartProducts.map((product) => (
          <div key={product.id}>
            <span>
              {product.name} - {Number(product.price).toFixed(2)}
            </span>{" "}
            <span data-testid={`qty-${product.id}`}>
              {cart[product.id]}
            </span>{" "}
            <button
              data-testid={`inc-${product.id}`}
              onClick={() => changeQuantity(product.id, 1)}
            >
              +
            </button>{" "}
            <button
              data-testid={`dec-${product.id}`}
              onClick={() => changeQuantity(product.id, -1)}
            >
              -
            </button>{" "}
            <button
              data-testid={`remove-${product.id}`}
              onClick={() => removeProduct(product.id)}
            >
              Remove
            </button>
          </div>
        ))
      )}

      <p data-testid="total">Total: {total.toFixed(2)}</p>

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
