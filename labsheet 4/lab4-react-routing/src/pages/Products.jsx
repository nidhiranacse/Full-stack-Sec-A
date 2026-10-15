import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 55000,
    image: "💻",
    description:
      "Powerful laptop suitable for programming, study and daily work."
  },
  {
    id: 2,
    name: "Headphones",
    price: 1999,
    image: "🎧",
    description:
      "High quality over-ear headphones with noise cancellation."
  },
  {
    id: 3,
    name: "Smartwatch",
    price: 4999,
    image: "⌚",
    description:
      "Modern smartwatch with fitness and notification features."
  },
  {
    id: 4,
    name: "Camera",
    price: 45000,
    image: "📷",
    description:
      "Digital camera for high-quality photography."
  }
];

function Products() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);

  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader"></div>
        <h2>Loading Products...</h2>
      </div>
    );
  }

  return (
    <section className="products-page">

      <div className="page-heading">
        <p>OUR COLLECTION</p>
        <h1>Products</h1>
        <span>
          Explore our amazing collection of products.
        </span>
      </div>

      <div className="product-grid">

        {products.map((product) => (

          <div className="product-card" key={product.id}>

            <div className="product-image">
              {product.image}
            </div>

            <h2>{product.name}</h2>

            <p className="product-price">
              ₹{product.price.toLocaleString()}
            </p>

            <Link
              to={`/products/${product.id}`}
              className="details-button"
            >
              View Details
            </Link>

          </div>

        ))}

      </div>

    </section>
  );
}

export { products };

export default Products;