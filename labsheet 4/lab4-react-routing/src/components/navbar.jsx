import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-content">

        <Link to="/" className="logo">
          MyShop
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/products">
            Products
          </Link>

          <span className="cart">
            🛒 Cart ({cartCount})
          </span>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;