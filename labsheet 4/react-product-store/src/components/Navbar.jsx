import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
    const { getCartCount } = useCart();

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                TechStore
            </Link>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>
                <span className="cart">
                    🛒 Cart ({getCartCount()})
                </span>
            </div>
        </nav>
    );
}

export default Navbar;