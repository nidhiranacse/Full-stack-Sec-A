import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cart } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        SILK SKIN
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/products">
          Products
        </Link>

        <Link to="/cart" className="cart-link">
           Cart ({cart.length})
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;