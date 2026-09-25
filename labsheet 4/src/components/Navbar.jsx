import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>ShopReact</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
      </div>
    </nav>
  );
}

export default Navbar;