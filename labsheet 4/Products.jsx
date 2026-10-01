import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 50000
  },
  {
    id: 2,
    name: "Mobile Phone",
    price: 25000
  },
  {
    id: 3,
    name: "Headphones",
    price: 3000
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
    return <h2>Loading products...</h2>;
  }

  return (
    <div>
      <h1>Products</h1>

      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>

          <p>Price: ₹{product.price}</p>

          <Link to={`/products/${product.id}`}>
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Products;