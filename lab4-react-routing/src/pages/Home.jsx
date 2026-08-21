import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to ShopKart 🛍️</h1>

      <p>
        Discover amazing products at affordable prices.
      </p>

      <Link to="/products" className="btn">
        Explore Products
      </Link>
    </div>
  );
};

export default Home;