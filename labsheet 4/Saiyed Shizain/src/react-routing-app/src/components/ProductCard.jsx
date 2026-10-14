import { useCart } from "../context/CartContext";

// Catalogue card that adds its product to the global cart.
function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <article className="product-card">
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </article>
  );
}

export default ProductCard;
