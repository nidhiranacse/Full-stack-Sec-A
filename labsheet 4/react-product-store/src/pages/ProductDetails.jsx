import { Link, useParams } from "react-router-dom";
import products from "../products";
import { useCart } from "../context/CartContext";

function ProductDetails() {
    const { id } = useParams();
    const { addToCart } = useCart();

    const product = products.find((item) => item.id === Number(id));

    if (!product) {
        return (
            <div className="not-found">
                <h1>Product Not Found</h1>
                <p>The product you are looking for does not exist.</p>
                <Link to="/products" className="primary-button">
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="details-card">
                <div className="details-icon">🛍️</div>

                <div className="details-content">
                    <span className="category">{product.category}</span>
                    <h1>{product.name}</h1>
                    <p>{product.description}</p>

                    <h2>₹{product.price}</h2>

                    <button
                        className="primary-button"
                        onClick={() => addToCart(product)}
                    >
                        Add to Cart
                    </button>

                    <Link to="/products" className="back-link">
                        ← Back to Products
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;