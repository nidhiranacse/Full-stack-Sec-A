import { useCart } from "./CartContext";

export default function Cart() {
  const {
    cart,
    increment,
    decrement,
    remove,
    total,
  } = useCart();

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="empty">Cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>₹{item.price.toLocaleString()}</p>
              </div>

              <div className="quantity">
                <button onClick={() => decrement(item.id)}>
                  −
                </button>

                <span>{item.qty}</span>

                <button onClick={() => increment(item.id)}>
                  +
                </button>
              </div>

              <button
                className="remove"
                onClick={() => remove(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div
            className="cart-total"
            data-testid="cart-total"
          >
            Cart Total: ₹{total.toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}