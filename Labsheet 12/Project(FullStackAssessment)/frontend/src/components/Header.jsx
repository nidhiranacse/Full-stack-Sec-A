
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { cartCount } = useCart();

  return (
    <header className="site-header">
      <a className="brand" href="#home">
        <span className="brand-icon">
          <Sparkles size={21} />
        </span>
        <span>nexa<span className="brand-dot">.</span></span>
      </a>

      <nav className="main-nav">
        <a href="#home">Home</a>
        <a href="#products">Explore</a>
        <a href="#cart">Your cart</a>
      </nav>

      <a className="header-cart" href="#cart" aria-label={`Cart with ${cartCount} items`}>
        <ShoppingBag size={19} />
        <span>Cart</span>
        <span className="cart-badge">{cartCount}</span>
      </a>
    </header>
  );
}
