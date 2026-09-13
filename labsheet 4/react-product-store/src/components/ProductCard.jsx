import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
    const { addToCart } = useCart();

    return (
        <div className="product-card">
            <div className="product-icon">🛍️</div>

            <span className="category">{product.category}</span>
            <h3>{product.name}</h3>
            <p>{product.description}</p>

            <div className="product-bottom">
                <strong>₹{product.price}</strong>

                <div className="product-buttons">
                    <Link to={`/products/${product.id}`} className="details-button">
                        Details
                    </Link>

                    <button onClick={() => addToCart(product)}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;