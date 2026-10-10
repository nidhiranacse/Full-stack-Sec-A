// ─── Cart Sidebar Component ─────────────────────────────────────────
// Reads cart state from CartContext.
// Shows each item with increment / decrement controls.
// Displays the cart total with data-testid="cart-total".

import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { cart, dispatch } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <aside className="cart">
      <h2 className="cart__title">🛒 Cart</h2>

      {cart.length === 0 && (
        <p className="cart__empty">Your cart is empty</p>
      )}

      {cart.map((item) => (
        <div key={item.id} className="cart-item">
          <div className="cart-item__info">
            <div className="cart-item__name">{item.name}</div>
            <div className="cart-item__price">
              ${item.price.toFixed(2)} each
            </div>
          </div>

          <div className="cart-item__controls">
            <button
              className="cart-item__qty-btn cart-item__qty-btn--dec"
              onClick={() => dispatch({ type: 'DEC', id: item.id })}
              title="Decrease quantity"
            >
              −
            </button>
            <span className="cart-item__qty">{item.qty}</span>
            <button
              className="cart-item__qty-btn"
              onClick={() => dispatch({ type: 'INC', id: item.id })}
              title="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <hr className="cart__divider" />
          <div className="cart__total">
            <span>Total</span>
            <span className="cart__total-amount" data-testid="cart-total">
              ${total.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </aside>
  );
}
