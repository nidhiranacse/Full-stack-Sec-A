import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cart } = useCart();

  return (
    <nav>
      <Link to="/">Home</Link>{" | "}
      <Link to="/products">Products</Link>{" | "}
      Cart: {cart.length}
    </nav>
  );
}

export default Navbar;