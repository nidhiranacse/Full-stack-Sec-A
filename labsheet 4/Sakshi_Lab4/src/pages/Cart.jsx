import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <p className="eyebrow">YOUR SHOPPING BAG</p>

        <h1>Your Cart is Empty</h1>

        <p>
          You haven't added any skincare products yet.
        </p>

        <Link to="/products" className="primary-btn">
          Explore Products
        </Link>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <p className="eyebrow">YOUR SHOPPING BAG</p>

      <h1>Your Cart</h1>

      <div className="cart-items">
        {cart.map((product, index) => (
          <div className="cart-item" key={`${product.id}-${index}`}>
            <div className="cart-product-image">
              {product.emoji}
            </div>

            <div className="cart-product-info">
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <strong>₹{product.price}</strong>
            </div>

            <button
              className="remove-btn"
              onClick={() => removeFromCart(product.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <Link to="/products" className="continue-shopping">
        ← Continue Shopping
      </Link>
    </main>
  );
}

export default Cart;