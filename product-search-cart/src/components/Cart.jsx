import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    increment,
    decrement,
    remove,
    totalQuantity,
    totalPrice
  } = useCart();

  return (
    <aside className="cart">
      <h2>Your Cart</h2>

      <div
        className="cart-total"
        data-testid="cart-total"
      >
        Cart Total: {"\u20B9"}{totalPrice.toLocaleString("en-IN")}
      </div>

      {cart.length === 0 ? (
        <p className="empty-cart">
          Your cart is empty.
        </p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div
                className="cart-item"
                key={item.id}
              >
                <div className="cart-item-info">
                  <h4>{item.title}</h4>

                  <p>
                    {"\u20B9"}{item.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => decrement(item.id)}
                    aria-label={`Decrease ${item.title} quantity`}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => increment(item.id)}
                    aria-label={`Increase ${item.title} quantity`}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => remove(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div>
              <span>Total Items</span>
              <strong>{totalQuantity}</strong>
            </div>

            <div>
              <span>Total Price</span>
              <strong>
                {"\u20B9"}{totalPrice.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

export default Cart;
