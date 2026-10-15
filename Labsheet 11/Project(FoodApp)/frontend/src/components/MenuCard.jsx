import { Plus, Check, Clock3 } from "lucide-react";

export default function MenuCard({ item, quantity, onAdd }) {
  const unavailable = !item.isAvailable;

  return (
    <article className={`menu-card ${unavailable ? "unavailable" : ""}`}>
      <div className="food-art">
        <span className="food-emoji">
          {item.category?.toLowerCase().includes("drink") ? "🥤" :
           item.category?.toLowerCase().includes("dessert") ? "🍰" :
           item.category?.toLowerCase().includes("pizza") ? "🍕" :
           item.category?.toLowerCase().includes("burger") ? "🍔" :
           item.category?.toLowerCase().includes("salad") ? "🥗" : "🍽️"}
        </span>
        <span className="food-category">{item.category || "Special"}</span>
        {quantity > 0 && <span className="in-cart"><Check size={13} /> {quantity} in cart</span>}
      </div>

      <div className="menu-card-content">
        <div className="food-title-row">
          <h3>{item.name}</h3>
          <span className="food-price">₹{Number(item.price).toFixed(2)}</span>
        </div>
        <p className="food-description">
          Freshly prepared and made for your cravings.
        </p>
        <div className="food-card-footer">
          <span className="prep-time"><Clock3 size={14} /> Freshly made</span>
          <button
            className={`add-button ${unavailable ? "disabled" : ""}`}
            disabled={unavailable}
            onClick={() => onAdd(item)}
          >
            {unavailable ? "Unavailable" : <><Plus size={17} /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
}