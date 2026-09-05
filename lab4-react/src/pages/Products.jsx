import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 60000,
    description: "Powerful laptop for programming and daily use.",
  },
  {
    id: 2,
    name: "Smartphone",
    price: 25000,
    description: "Modern smartphone with excellent performance.",
  },
  {
    id: 3,
    name: "Headphones",
    price: 3000,
    description: "Wireless headphones with high quality sound.",
  },
  {
    id: 4,
    name: "Keyboard",
    price: 1500,
    description: "Mechanical keyboard suitable for programmers.",
  },
];

function Products() {
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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

            <p>₹{product.price}</p>

            <Link to={`/products/${product.id}`}>
              <button>View Details</button>
            </Link>

            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;