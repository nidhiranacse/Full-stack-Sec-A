
import { useState } from "react";

const DISCOUNT_THRESHOLD = 1000;
const DISCOUNT_RATE = 0.10;

export default function Cart({ products = [] }) {
  const [cart, setCart] = useState({});

  function addProduct(product) {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }));
  }

  function changeQuantity(id, amount) {
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;

      const quantity = item.quantity + amount;
      const updated = { ...prev };

      if (quantity <= 0) {
        delete updated[id];
      } else {
        updated[id] = { ...item, quantity };
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

  const items = Object.values(cart);

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.product.price) * item.quantity,
    0
  );

  const discount =
    total >= DISCOUNT_THRESHOLD
      ? total * DISCOUNT_RATE
      : 0;

  const grandTotal = total - discount;

  const money = (amount) => amount.toFixed(2);

  return (
    <div>
      <h2>Products</h2>

      {products.map((product) => (
        <div key={product.id}>
          <span>
            {product.name} - {money(Number(product.price))}
          </span>{" "}
          <button
            data-testid={`add-${product.id}`}
            onClick={() => addProduct(product)}
          >
            Add
          </button>
        </div>
      ))}

      <h2>Shopping Cart</h2>

      {items.length === 0 ? (
        <p data-testid="cart-empty">Cart is empty</p>
      ) : (
        items.map(({ product, quantity }) => (
          <div key={product.id}>
            <span>{product.name} </span>

            <span data-testid={`qty-${product.id}`}>
              {quantity}
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

      <p data-testid="total">Total: {money(total)}</p>

      {discount > 0 && (
        <>
          <p data-testid="discount">
            Discount: {money(discount)}
          </p>
          <p data-testid="grand-total">
            Grand Total: {money(grandTotal)}
          </p>
        </>
      )}
    </div>
  );
}

