
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);

export default function CartPanel() {
  const {
    cart,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
  } = useCart();

  return (
    <aside className="cart-panel" id="cart">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">YOUR SELECTION</p>
          <h2>Your cart <span className="cart-item-count">{cart.length}</span></h2>
        </div>
        <ShoppingBag size={23} />
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <ShoppingBag size={25} />
          </div>
          <h3>Your cart is waiting</h3>
          <p>Add something you love and it will show up here.</p>
          <a href="#products" className="browse-link">Explore products ↗</a>
        </div>
      ) : (
        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />

              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price)}</p>

                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.id)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    <Minus size={13} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.id)}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <strong data-testid="cart-total">{formatPrice(cartTotal)}</strong>
        </div>
        <div className="summary-row delivery-row">
          <span>Delivery</span>
          <span>{cart.length ? "Calculated at checkout" : "—"}</span>
        </div>
        <button className="checkout-btn" type="button" disabled={cart.length === 0}>
          {cart.length ? "Continue to checkout ↗" : "Your cart is empty"}
        </button>
        <p className="secure-note">A little something to make your day.</p>
      </div>
    </aside>
  );
}
