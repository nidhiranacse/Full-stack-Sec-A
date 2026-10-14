import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Top navigation shared by every route.
function Navbar() {
  const { cart } = useCart();
  return (
    <nav className="navbar">
      <h2>ShopReact — Saiyed Shizain</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <span className="cart-count">Cart: {cart.length}</span>
      </div>
    </nav>
  );
}

export default Navbar;
