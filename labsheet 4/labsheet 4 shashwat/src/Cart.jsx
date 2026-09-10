import { Link } from 'react-router-dom'
import { useCart } from './CartContext.jsx'

/* ========================
   Cart Page
   - Reads cart items from global Context
   - Remove items from cart
   - Shows total price
   ======================== */

function Cart() {
  const { cart, removeFromCart } = useCart()

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h2>Your Cart</h2>
        <p className="empty-cart">Your cart is empty.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      <div className="cart-list">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <span className="cart-item-emoji">{item.image}</span>
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
            <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <strong>Total: ₹{total}</strong>
      </div>
    </div>
  )
}

export default Cart
