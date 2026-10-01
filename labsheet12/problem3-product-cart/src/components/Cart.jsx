import { useCart } from "../context/CartContext";

function Cart() {
  const { items, total, dispatch } = useCart();

  return (
    <section>
      <h2>Cart</h2>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        items.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>

            <p>
              ₹{item.price} × {item.quantity}
            </p>

            <button
              onClick={() =>
                dispatch({
                  type: "DECREMENT",
                  payload: item.id,
                })
              }
            >
              -
            </button>

            <span> {item.quantity} </span>

            <button
              onClick={() =>
                dispatch({
                  type: "INCREMENT",
                  payload: item.id,
                })
              }
            >
              +
            </button>
          </div>
        ))
      )}

      <h3 data-testid="cart-total">
        Total: ₹{total}
      </h3>
    </section>
  );
}

export default Cart;