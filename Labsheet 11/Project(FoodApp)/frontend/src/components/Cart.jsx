import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart({
  cart,
  onChangeQty,
  onRemove,
  customer,
  setCustomer,
  onCheckout,
  loading,
}) {
  const total = cart.reduce(
    (sum, entry) => sum + Number(entry.price) * entry.qty,
    0
  );

  const updateCustomer = (event) => {
    setCustomer({ ...customer, [event.target.name]: event.target.value });
  };

  return (
    <aside className="cart-panel">
      <div className="cart-heading">
        <div>
          <span className="eyebrow">YOUR SELECTION</span>
          <h2>Your cart <span className="cart-count">{cart.length}</span></h2>
        </div>
        <ShoppingBag size={23} />
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <span className="empty-cart-icon">🛍️</span>
          <h3>Your cart is hungry</h3>
          <p>Add something delicious from the menu to get started.</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((entry) => (
              <div className="cart-item" key={entry._id}>
                <div className="cart-item-info">
                  <strong>{entry.name}</strong>
                  <span>₹{Number(entry.price).toFixed(2)} each</span>
                  <button
                    className="remove-link"
                    onClick={() => onRemove(entry._id)}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>

                <div className="quantity-control">
                  <button
                    aria-label={`Decrease ${entry.name} quantity`}
                    onClick={() => onChangeQty(entry._id, -1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{entry.qty}</span>
                  <button
                    aria-label={`Increase ${entry.name} quantity`}
                    onClick={() => onChangeQty(entry._id, 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <span>Subtotal</span>
            <strong>₹{total.toFixed(2)}</strong>
          </div>

          <div className="checkout-form">
            <h3>Delivery details</h3>

            <label htmlFor="customerName">Full name</label>
            <input
              id="customerName"
              name="customerName"
              placeholder="Enter your name"
              value={customer.customerName}
              onChange={updateCustomer}
              required
            />

            <label htmlFor="phone">10-digit phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={customer.phone}
              onChange={updateCustomer}
              required
            />

            <label htmlFor="address">Delivery address</label>
            <textarea
              id="address"
              name="address"
              rows={3}
              placeholder="House number, street, area..."
              value={customer.address}
              onChange={updateCustomer}
              required
            />

            <button
              className="primary-button checkout-button"
              onClick={onCheckout}
              disabled={loading}
            >
              {loading ? "Placing order..." : <>Place order · ₹{total.toFixed(2)} <ArrowRight size={17} /></>}
            </button>
            <p className="secure-note">Your final total is verified by the server.</p>
          </div>
        </>
      )}
    </aside>
  );
}