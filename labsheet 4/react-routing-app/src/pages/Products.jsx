import { Link } from "react-router-dom";
import { products } from "../data";

function Products() {
  return (
    <main className="page">
      <h1>Products</h1>

      <div className="product-grid">
        {products.map((product) => (
          <article
            className="product-card"
            key={product.id}
          >
            <h3>{product.name}</h3>

            <p>{product.category}</p>

            <strong>₹{product.price}</strong>

            <Link to={`/products/${product.id}`}>
              View Details
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Products;