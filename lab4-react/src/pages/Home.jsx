import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <h1>Welcome to ShopEasy 🛍️</h1>

      <p>
        A simple React Single Page Application using React Router
        and Context API.
      </p>

      <Link to="/products">
        <button>View Products</button>
      </Link>
    </div>
  );
}

export default Home;