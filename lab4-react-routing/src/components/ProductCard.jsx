import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} />

      <h3>{product.title}</h3>

      <p>${product.price}</p>

      <div className="card-buttons">
        <Link to={`/products/${product.id}`}>
          View Details
        </Link>

        <button onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;