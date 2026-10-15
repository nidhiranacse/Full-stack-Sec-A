import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { dispatch } = useCart();

  return (
    <div className="product-card" data-testid="product-item">
      <div className="product-emoji">{product.image}</div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
      </div>
      <button
        data-testid="add-btn"
        className="add-to-cart-btn"
        onClick={() => dispatch({ type: "ADD_ITEM", product })}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add to Cart
      </button>
    </div>
  );
}
