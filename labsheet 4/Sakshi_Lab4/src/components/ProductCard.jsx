import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.emoji}
      </div>

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <p className="product-price">
          ₹{product.price}
        </p>

        <div className="product-buttons">
          <Link
            to={`/products/${product.id}`}
            className="details-btn"
          >
            View Details
          </Link>

          <button
            className="cart-btn"
            onClick={handleAddToCart}
          >
            {added ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;