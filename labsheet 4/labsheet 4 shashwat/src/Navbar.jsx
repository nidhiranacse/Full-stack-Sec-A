import { Link } from 'react-router-dom'
import { useCart } from './CartContext.jsx'

/* ========================
   Navbar Component
   - Navigation links using react-router Link
   - Shows cart item count from global context
   ======================== */

function Navbar() {
  const { cart } = useCart()

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">ShopApp</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li>
          <Link to="/cart" className="cart-link">
            🛒 Cart {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
