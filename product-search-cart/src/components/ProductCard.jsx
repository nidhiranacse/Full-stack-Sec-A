import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div
      className="product-card"
      data-testid="product-item"
    >
      <img
        className="product-image"
        src={product.image}
        alt={product.title}
      />

      <h3>{product.title}</h3>

      <p className="category">
        {product.category}
      </p>

      <p className="price">
        {"\u20B9"}{product.price.toLocaleString("en-IN")}
      </p>

      <button
        className="add-btn"
        data-testid="add-btn"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
