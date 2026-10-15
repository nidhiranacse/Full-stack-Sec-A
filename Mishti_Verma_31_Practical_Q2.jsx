
import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const products = [
  { id: 1, name: "Laptop", price: 800, emoji: "💻", category: "Electronics" },
  { id: 2, name: "Wireless Mouse", price: 200, emoji: "🖱️", category: "Accessories" },
  { id: 3, name: "Keyboard", price: 150, emoji: "⌨️", category: "Accessories" },
  { id: 4, name: "Headphones", price: 500, emoji: "🎧", category: "Electronics" },
  { id: 5, name: "Backpack", price: 700, emoji: "🎒", category: "Lifestyle" },
  { id: 6, name: "Smart Watch", price: 1200, emoji: "⌚", category: "Electronics" }
];

function App() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [message, setMessage] = useState("");

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const money = amount => amount.toFixed(2);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || p.category === category)
  );

  const addToCart = product => {
    setCart(old => {
      const found = old.find(item => item.id === product.id);
      return found
        ? old.map(item => item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item)
        : [...old, { ...product, quantity: 1 }];
    });
    setMessage(product.name + " added to cart!");
  };

  const updateQuantity = (id, amount) => {
    setCart(old => old
      .map(item => item.id === id
        ? { ...item, quantity: item.quantity + amount }
        : item)
      .filter(item => item.quantity > 0));
  };

  const removeItem = id => {
    setCart(old => old.filter(item => item.id !== id));
    setMessage("Product removed from cart.");
  };

  const subtotal = cart.reduce((sum, item) =>
    sum + item.price * item.quantity, 0);
  const discount = subtotal >= 1000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; background: #f3f6fc; color: #172b4d; }
        header { background: #172d4d; color: white; padding: 20px 5%; display: flex; justify-content: space-between; align-items: center; }
        header h1 { margin: 0; font-size: 26px; }
        .count { background: #ff5268; border-radius: 20px; padding: 9px 15px; }
        main { max-width: 1400px; margin: auto; padding: 25px 4%; }
        .hero { background: #e0ecff; border-radius: 15px; padding: 25px; margin-bottom: 22px; }
        .hero h2 { margin-top: 0; }
        .layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; align-items: start; }
        .panel { background: white; padding: 20px; border-radius: 14px; border: 1px solid #e0e8f4; min-width: 0; }
        .filters { display: flex; gap: 10px; margin: 18px 0; }
        input, select { padding: 11px; border: 1px solid #d6e0ef; border-radius: 8px; min-width: 0; }
        input { flex: 1; }
        .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .product { border: 1px solid #e1e9f5; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; }
        .emoji { background: #f0f5ff; border-radius: 10px; height: 95px; display: grid; place-items: center; font-size: 44px; margin-bottom: 10px; }
        .product h3 { font-size: 15px; margin: 4px 0 8px; }
        .category-label { color: #7788a0; font-size: 12px; margin-bottom: 10px; }
        .price { color: #1768df; font-weight: bold; margin-top: auto; }
        button { cursor: pointer; font: inherit; }
        .add, .checkout { border: 0; border-radius: 8px; padding: 11px 7px; margin-top: 12px; font-weight: bold; }
        .add { background: #287bf0; color: white; }
        .checkout { width: 100%; background: #0e9e68; color: white; }
        .checkout:disabled { opacity: .5; cursor: not-allowed; }
        .cart-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .cart-head h2 { font-size: 21px; }
        .clear, .remove { background: #fff3f4; color: #d7374d; border: 1px solid #ffd3d8; border-radius: 7px; padding: 7px; }
        .cart-item { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 15px 0; border-bottom: 1px solid #e8eef6; }
        .cart-emoji { background: #f0f5ff; height: 40px; width: 40px; display: grid; place-items: center; border-radius: 9px; font-size: 22px; }
        .item-name { font-weight: bold; font-size: 14px; overflow-wrap: anywhere; }
        .item-price { color: #7788a0; font-size: 12px; margin-top: 5px; }
        .quantity { display: flex; align-items: center; margin-top: 8px; width: fit-content; border: 1px solid #dce5f2; border-radius: 7px; overflow: hidden; }
        .quantity button { border: 0; background: #f3f7fd; padding: 5px 10px; }
        .quantity span { min-width: 28px; text-align: center; }
        .right { text-align: right; }
        .right .remove { display: block; margin-top: 8px; }
        .empty { background: #f6f8fc; color: #75859c; padding: 25px 10px; text-align: center; border-radius: 10px; }
        .summary { background: #f0f5ff; border-radius: 10px; padding: 15px; margin-top: 18px; }
        .row { display: flex; justify-content: space-between; gap: 10px; margin: 12px 0; }
        .discount { color: #0b9663; }
        .grand { border-top: 1px solid #d7e2f2; padding-top: 14px; font-size: 18px; font-weight: bold; }
        .hint { color: #6c809b; font-size: 12px; line-height: 1.5; }
        .notice { background: #e7fbf2; color: #08784f; border: 1px solid #bce9d7; border-radius: 8px; padding: 12px; margin-top: 18px; }
        .notice button { float: right; border: 0; background: transparent; color: inherit; }
        @media(max-width: 900px) { .layout { grid-template-columns: 1fr; } }
        @media(max-width: 560px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } main { padding: 15px 10px; } .panel { padding: 13px; } .filters { flex-wrap: wrap; } input { width: 100%; } }
      `}</style>

      <header>
        <h1>🛒 ShopCart</h1>
        <div className="count">Cart: {count}</div>
      </header>

      <main>
        <section className="hero">
          <h2>Better Products, Better Life ✨</h2>
          <p>Shop your favorites and get an automatic 10% discount on purchases of ₹1,000 or more.</p>
        </section>

        <div className="layout">
          <section className="panel">
            <h2>Available Products</h2>
            <div className="filters">
              <input aria-label="Search products" placeholder="Search products..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <select aria-label="Filter category" value={category}
                onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid">
              {filtered.map(p => (
                <article className="product" key={p.id}>
                  <div className="emoji">{p.emoji}</div>
                  <h3>{p.name}</h3>
                  <div className="category-label">{p.category}</div>
                  <div className="price">₹{money(p.price)}</div>
                  <button className="add" onClick={() => addToCart(p)}>Add to Cart</button>
                </article>
              ))}
            </div>
            {filtered.length === 0 && <p className="empty">No products found.</p>}
          </section>

          <aside className="panel">
            <div className="cart-head">
              <h2>Your Cart ({count})</h2>
              {cart.length > 0 && <button className="clear" onClick={() => {
                setCart([]);
                setMessage("Cart cleared.");
              }}>Clear Cart</button>}
            </div>

            {cart.length === 0 ? (
              <div className="empty">🛍️<br /><strong>Your cart is empty</strong></div>
            ) : cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-emoji">{item.emoji}</div>
                <div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">₹{money(item.price)} each</div>
                  <div className="quantity">
                    <button aria-label={`Decrease ${item.name}`}
                      onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button aria-label={`Increase ${item.name}`}
                      onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
                <div className="right">
                  <strong>₹{money(item.price * item.quantity)}</strong>
                  <button className="remove" onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              </div>
            ))}

            <div className="summary">
              <div className="row"><span>Subtotal</span><span>₹{money(subtotal)}</span></div>
              <div className="row discount"><span>Discount (10%)</span><span>−₹{money(discount)}</span></div>
              <div className="row grand"><span>Grand Total</span><span>₹{money(total)}</span></div>
              <button className="checkout" disabled={cart.length === 0}
                onClick={() => setMessage("Demo checkout: your cart is ready!")}>
                Proceed to Checkout
              </button>
              <p className="hint">
                {discount > 0
                  ? `You saved ₹${money(discount)}!`
                  : `Add ₹${money(Math.max(0, 1000 - subtotal))} more to unlock the discount.`}
              </p>
            </div>
          </aside>
        </div>

        {message && <div className="notice" role="status">
          {message}<button onClick={() => setMessage("")}>✕</button>
        </div>}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
