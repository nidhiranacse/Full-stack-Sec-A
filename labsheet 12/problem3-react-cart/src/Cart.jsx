import { useCart } from './CartContext';

export default function Cart() {
  const { items, total, dispatch } = useCart();
  return (
    <aside className="cart">
      <h2>Cart</h2>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.map((i) => (
        <div key={i.id} className="cart-row">
          <span>{i.name}</span>
          <span>
            <button onClick={() => dispatch({ type: 'DEC', id: i.id })}>-</button>
            <span className="qty">{i.qty}</span>
            <button onClick={() => dispatch({ type: 'INC', id: i.id })}>+</button>
          </span>
          <span>${(i.price * i.qty).toFixed(2)}</span>
          <button onClick={() => dispatch({ type: 'REMOVE', id: i.id })}>x</button>
        </div>
      ))}
      <h3>
        Total: $<span data-testid="cart-total">{total.toFixed(2)}</span>
      </h3>
    </aside>
  );
}
