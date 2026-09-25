import { Link, useParams } from "react-router-dom";
import { products } from "../data";

function ProductDetails() {
  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return <h2>Product not found</h2>;
  }

  return (
    <main className="page">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <h2>₹{product.price}</h2>
      <p>Category: {product.category}</p>

      <Link to="/products">← Back to Products</Link>
    </main>
  );
}

export default ProductDetails;