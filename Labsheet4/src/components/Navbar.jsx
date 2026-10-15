import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cart } = useCart();

  return (
    <nav className="navbar">
      <h2>My Store</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <span className="cart">
          Cart: {cart.length}
        </span>
      </div>
    </nav>
  );
}

export default Navbar;