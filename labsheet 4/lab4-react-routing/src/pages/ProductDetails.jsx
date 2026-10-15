import { Link, useParams } from "react-router-dom";
import { products } from "./Products";
import { useCart } from "../context/CartContext";

function ProductDetails() {

  const { id } = useParams();

  const { addToCart } = useCart();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {

    return (
      <div className="product-not-found">

        <h1>Product Not Found</h1>

        <Link to="/products" className="details-button">
          Back to Products
        </Link>

      </div>
    );
  }

  return (
    <section className="details-page">

      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>

      <div className="details-box">

        <div className="details-image">
          {product.image}
        </div>

        <div className="details-content">

          <span className="available">
            ✓ IN STOCK
          </span>

          <h1>{product.name}</h1>

          <h2>
            ₹{product.price.toLocaleString()}
          </h2>

          <p>
            {product.description}
          </p>

          <div className="quantity">
            <span>Quantity</span>

            <select>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </div>

          <div className="action-buttons">

            <button
              className="cart-button"
              onClick={() => addToCart(product)}
            >
              🛒 Add to Cart
            </button>

            <button className="favorite-button">
              ♡ Add to Favorites
            </button>

          </div>

        </div>

      </div>

      <div className="features">

        <div>
          🔊
          <b>High Quality</b>
          <span>Premium product</span>
        </div>

        <div>
          ⚡
          <b>Fast Delivery</b>
          <span>Quick shipping</span>
        </div>

        <div>
          🛡️
          <b>1 Year Warranty</b>
          <span>Secure purchase</span>
        </div>

      </div>

    </section>
  );
}

export default ProductDetails;