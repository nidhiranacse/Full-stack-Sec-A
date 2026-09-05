import { Link, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./components/Navbar";
import { useCart } from "./context/CartContext";
import NotFound from "./pages/NotFound";

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to Lab 4!</p>

      <Link to="/products">
        Go to Products
      </Link>
    </div>
  );
}

function Products() {
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  const products = [
    {
      id: 1,
      name: "Laptop",
      price: 60000,
      description: "Powerful laptop for programming and daily use."
    },
    {
      id: 2,
      name: "Smartphone",
      price: 25000,
      description: "Modern smartphone with excellent performance."
    },
    {
      id: 3,
      name: "Headphones",
      price: 3000,
      description: "Wireless headphones with high quality sound."
    },
    {
      id: 4,
      name: "Keyboard",
      price: 1500,
      description: "Mechanical keyboard suitable for programmers."
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>Loading Products...</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Products</h1>

      <div className="products">

        {products.map((product) => (
          <div className="product-card" key={product.id}>

            <h2>{product.name}</h2>

            <h3>₹{product.price}</h3>

            <p>{product.description}</p>

            <Link to={`/products/${product.id}`}>
              <button>View Details</button>
            </Link>

            <button
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </div>
  );
}

export default App;