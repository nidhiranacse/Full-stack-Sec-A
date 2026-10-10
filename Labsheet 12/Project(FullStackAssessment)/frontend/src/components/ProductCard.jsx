
import { Heart, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);

  return (
    <article className="product-card" data-testid="product-item">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        <button
          className={`wishlist-btn ${liked ? "liked" : ""}`}
          onClick={() => setLiked(!liked)}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          type="button"
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>

        <span className="category-pill">{product.category}</span>
      </div>

      <div className="product-details">
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <span className="product-rating">
            <Star size={14} fill="currentColor" />
            {product.rating}
          </span>
        </div>

        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>

          <button
            className="add-btn"
            data-testid="add-btn"
            onClick={() => addToCart(product)}
            type="button"
          >
            <Plus size={17} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
