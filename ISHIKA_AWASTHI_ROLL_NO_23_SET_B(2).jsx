import React, { useRef, useState } from "react";

/**
 * Cart — default export.
 *
 * Props
 *  - products: [{ id, name, price }]  (optional; sample items are used if omitted)
 *  - discountThreshold: number        (default 1000)
 *  - discountRate: number             (default 0.1 = 10%)
 *
 * Users can also add their own products from the "Add your own product"
 * form, remove those products again, and clear the cart.
 */

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Notebook", price: 120 },
  { id: 2, name: "Headphones", price: 450 },
  { id: 3, name: "Mechanical Keyboard", price: 799.99 },
  { id: 4, name: "Backpack", price: 1200 },
];

const fmt = (n) => n.toFixed(2);
const cents = (n) => Math.round(n * 100);

// Stable hue per product so every tile gets its own colour
const hueFor = (id) => {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600&display=swap');

.cx {
  --bg: #EAEFF5; --surface: #FFFFFF; --ink: #17202E; --muted: #5D6B82;
  --line: #DCE3EC; --accent: #3A46F0; --accent-ink: #FFFFFF;
  --save: #0E7A55; --save-bg: #DDF5EA; --danger: #C2362B;
  --tile-bg: 70% 91%; --tile-fg: 55% 32%;
  --shadow: 0 1px 2px rgba(23,32,46,.06), 0 10px 30px -12px rgba(23,32,46,.18);
  font-family: 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink); background: var(--bg);
  min-height: 100vh; padding: 40px 20px; box-sizing: border-box;
}
@media (prefers-color-scheme: dark) {
  .cx {
    --bg: #0F1520; --surface: #172030; --ink: #E8EEF7; --muted: #93A1B8;
    --line: #263349; --accent: #8189FF; --accent-ink: #0F1520;
    --save: #5FDDAA; --save-bg: #12372B; --danger: #FF8A80;
    --tile-bg: 35% 25%; --tile-fg: 80% 82%;
    --shadow: 0 1px 2px rgba(0,0,0,.4), 0 10px 30px -12px rgba(0,0,0,.6);
  }
}
.cx *, .cx *::before, .cx *::after { box-sizing: border-box; }
.cx button { font: inherit; color: inherit; cursor: pointer; }
.cx button:focus-visible, .cx input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.cx-shell { max-width: 1080px; margin: 0 auto; display: grid; gap: 28px;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); align-items: start; }
@media (max-width: 820px) { .cx-shell { grid-template-columns: 1fr; } }

.cx-h { font-family: 'Bricolage Grotesque', 'Figtree', system-ui, sans-serif;
  font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.cx-title { font-size: clamp(30px, 5vw, 44px); line-height: 1.05; margin-bottom: 6px; }
.cx-sub { color: var(--muted); margin: 0 0 22px; font-size: 15px; }

.cx-grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); }
.cx-card { position: relative; background: var(--surface); border: 1px solid var(--line); border-radius: 18px;
  padding: 16px; display: flex; flex-direction: column; gap: 14px; box-shadow: var(--shadow); }
.cx-tile { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center;
  font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 26px;
  background: hsl(var(--h) var(--tile-bg)); color: hsl(var(--h) var(--tile-fg)); }
.cx-name { font-weight: 600; font-size: 16px; line-height: 1.25; margin: 0; overflow-wrap: anywhere; }
.cx-price { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 20px;
  font-variant-numeric: tabular-nums; }
.cx-card-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.cx-pill { font-size: 12px; font-weight: 600; color: var(--save); background: var(--save-bg);
  padding: 3px 9px; border-radius: 999px; }
.cx-add { background: var(--accent); color: var(--accent-ink) !important; border: 0; border-radius: 12px;
  padding: 10px 16px; font-weight: 600; transition: transform .12s ease, filter .12s ease; }
.cx-add:hover { filter: brightness(1.08); }
.cx-add:active { transform: scale(.95); }
.cx-del { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 8px;
  border: 0; background: transparent; color: var(--muted); font-size: 18px; line-height: 1; }
.cx-del:hover { color: var(--danger); background: var(--bg); }

.cx-new { margin-top: 24px; background: var(--surface); border: 1px solid var(--line);
  border-radius: 18px; padding: 18px; box-shadow: var(--shadow); }
.cx-new-title { font-size: 20px; margin-bottom: 4px; }
.cx-new-sub { color: var(--muted); font-size: 14px; margin: 0 0 14px; }
.cx-new-row { display: grid; grid-template-columns: minmax(0, 1fr) 130px auto; gap: 10px; align-items: end; }
@media (max-width: 560px) { .cx-new-row { grid-template-columns: 1fr 1fr; } .cx-new-row .cx-add { grid-column: 1 / -1; } }
.cx-field { display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: var(--muted); }
.cx-input { width: 100%; height: 42px; border-radius: 12px; border: 1px solid var(--line);
  background: var(--bg); color: var(--ink); padding: 0 12px; font: inherit; font-size: 15px; font-weight: 500; }
.cx-input::placeholder { color: var(--muted); opacity: .7; }
.cx-error { color: var(--danger); font-size: 13px; font-weight: 500; margin: 10px 0 0; }

.cx-panel { position: sticky; top: 24px; background: var(--surface); border: 1px solid var(--line);
  border-radius: 22px; box-shadow: var(--shadow); padding: 22px 22px 30px; }
.cx-panel::after { content: ''; position: absolute; left: -1px; right: -1px; bottom: -9px; height: 10px;
  background: radial-gradient(circle at 8px 0, var(--surface) 7px, transparent 7.5px) 0 0 / 16px 10px repeat-x; }
.cx-panel-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
.cx-panel-title { font-size: 24px; }
.cx-head-right { display: inline-flex; align-items: center; gap: 10px; }
.cx-count { color: var(--muted); font-size: 14px; font-weight: 500; }
.cx-clear { border: 0; background: transparent; color: var(--muted); font-size: 13px; padding: 4px 8px; border-radius: 8px; }
.cx-clear:hover { color: var(--danger); background: var(--bg); }

.cx-empty-wrap { text-align: center; padding: 28px 8px 22px; border: 1.5px dashed var(--line); border-radius: 14px; }
.cx-empty { font-weight: 600; font-size: 17px; margin: 0 0 4px; }
.cx-empty-hint { color: var(--muted); font-size: 14px; margin: 0; }

.cx-lines { list-style: none; margin: 0; padding: 0; }
.cx-line { display: grid; grid-template-columns: 1fr auto; gap: 8px 12px; padding: 14px 0;
  border-bottom: 1px solid var(--line); }
.cx-line-name { font-weight: 600; line-height: 1.25; overflow-wrap: anywhere; }
.cx-line-unit { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.cx-line-total { font-weight: 700; font-variant-numeric: tabular-nums; text-align: right; }
.cx-line-ctrl { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; }
.cx-step { display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; }
.cx-step button { width: 34px; height: 34px; border: 0; background: transparent; font-size: 18px; line-height: 1; }
.cx-step button:hover { background: var(--bg); }
.cx-qty { min-width: 32px; text-align: center; font-weight: 600; font-variant-numeric: tabular-nums; }
.cx-remove { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent;
  color: var(--muted); font-size: 13px; padding: 6px 8px; border-radius: 8px; }
.cx-remove:hover { color: var(--danger); background: var(--bg); }

.cx-meter { margin: 18px 0 4px; }
.cx-meter-msg { font-size: 13px; color: var(--muted); margin: 0 0 8px; }
.cx-meter-msg.is-done { color: var(--save); font-weight: 600; }
.cx-bar { height: 8px; border-radius: 999px; background: var(--bg); overflow: hidden; }
.cx-bar > i { display: block; height: 100%; border-radius: inherit; background: var(--accent);
  transition: width .35s ease; }
.cx-bar > i.is-done { background: var(--save); }

.cx-sums { margin-top: 16px; padding-top: 16px; border-top: 2px dashed var(--line); display: grid; gap: 6px; }
.cx-total { font-variant-numeric: tabular-nums; color: var(--muted); font-size: 15px; }
.cx-discount { font-variant-numeric: tabular-nums; color: var(--save); font-weight: 600; font-size: 15px; }
.cx-grand { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 28px;
  letter-spacing: -0.01em; font-variant-numeric: tabular-nums; margin-top: 4px; }
.cx-total.is-solo { color: var(--ink); font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800;
  font-size: 28px; letter-spacing: -0.01em; }
.cx-total.is-struck { text-decoration: line-through; text-decoration-thickness: 1px; }

@media (prefers-reduced-motion: reduce) {
  .cx * { transition: none !important; }
}
`;

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
  </svg>
);

export default function Cart({
  products = SAMPLE_PRODUCTS,
  discountThreshold = 1000,
  discountRate = 0.1,
}) {
  // cart lines: [{ id, qty }]
  const [lines, setLines] = useState([]);
  // products the user creates in the form
  const [custom, setCustom] = useState([]);
  const nextId = useRef(1);

  // add-product form state
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [formError, setFormError] = useState("");

  const allProducts = [...products, ...custom];

  const addProduct = (id) =>
    setLines((prev) =>
      prev.some((l) => l.id === id)
        ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { id, qty: 1 }]
    );

  const increase = (id) =>
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
    );

  // quantity never goes below 1; use remove to delete a line
  const decrease = (id) =>
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty - 1) } : l))
    );

  const remove = (id) => setLines((prev) => prev.filter((l) => l.id !== id));
  const clearCart = () => setLines([]);

  const createProduct = () => {
    const name = newName.trim();
    const price = Number(newPrice);
    if (!name) return setFormError("Enter a product name.");
    if (newPrice === "" || !Number.isFinite(price) || price <= 0)
      return setFormError("Enter a price greater than 0.");
    const id = `custom-${nextId.current++}`;
    setCustom((prev) => [...prev, { id, name, price: cents(price) / 100 }]);
    setNewName("");
    setNewPrice("");
    setFormError("");
  };

  const deleteCustom = (id) => {
    setCustom((prev) => prev.filter((p) => p.id !== id));
    remove(id);
  };

  const onFormKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createProduct();
    }
  };

  const cartItems = lines
    .map((l) => ({ ...l, product: allProducts.find((p) => p.id === l.id) }))
    .filter((l) => l.product);

  // work in cents to avoid floating point errors
  const totalCents = cartItems.reduce(
    (sum, l) => sum + cents(l.product.price) * l.qty,
    0
  );
  const total = totalCents / 100;
  const hasDiscount = total >= discountThreshold;
  const discountCents = hasDiscount ? Math.round(totalCents * discountRate) : 0;
  const discount = discountCents / 100;
  const grandTotal = (totalCents - discountCents) / 100;

  const itemCount = cartItems.reduce((n, l) => n + l.qty, 0);
  const progress = Math.min(100, (total / discountThreshold) * 100);
  const remaining = Math.max(0, discountThreshold - total);
  const pct = Math.round(discountRate * 100);

  return (
    <div className="cx">
      <style>{CSS}</style>
      <div className="cx-shell">
        <section aria-labelledby="cx-shop">
          <h1 id="cx-shop" className="cx-h cx-title">Shop</h1>
          <p className="cx-sub">
            Spend {fmt(discountThreshold)} or more and {pct}% comes off automatically.
          </p>
          <ul className="cx-grid">
            {allProducts.map((p) => {
              const inCart = lines.find((l) => l.id === p.id);
              const isCustom = String(p.id).startsWith("custom-");
              return (
                <li key={p.id} className="cx-card">
                  {isCustom && (
                    <button
                      type="button"
                      className="cx-del"
                      data-testid={`delete-product-${p.id}`}
                      aria-label={`Delete product ${p.name}`}
                      onClick={() => deleteCustom(p.id)}
                    >
                      ×
                    </button>
                  )}
                  <div className="cx-tile" style={{ "--h": hueFor(p.id) }} aria-hidden="true">
                    {String(p.name).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="cx-name">{p.name}</p>
                    <span className="cx-price">{fmt(p.price)}</span>
                  </div>
                  <div className="cx-card-foot">
                    {inCart ? <span className="cx-pill">{inCart.qty} in cart</span> : <span />}
                    <button
                      type="button"
                      className="cx-add"
                      data-testid={`add-${p.id}`}
                      aria-label={`Add ${p.name} to cart`}
                      onClick={() => addProduct(p.id)}
                    >
                      Add
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="cx-new">
            <h2 className="cx-h cx-new-title">Add your own product</h2>
            <p className="cx-new-sub">It appears in the shop right away, ready to add to your cart.</p>
            <div className="cx-new-row">
              <label className="cx-field">
                Name
                <input
                  className="cx-input"
                  data-testid="new-name"
                  placeholder="e.g. Desk lamp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={onFormKey}
                />
              </label>
              <label className="cx-field">
                Price
                <input
                  className="cx-input"
                  data-testid="new-price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  onKeyDown={onFormKey}
                />
              </label>
              <button type="button" className="cx-add" data-testid="create-product" onClick={createProduct}>
                Add product
              </button>
            </div>
            {formError && <p className="cx-error" role="alert">{formError}</p>}
          </div>
        </section>

        <aside className="cx-panel" aria-labelledby="cx-cart">
          <div className="cx-panel-head">
            <h2 id="cx-cart" className="cx-h cx-panel-title">Your cart</h2>
            <span className="cx-head-right">
              <span className="cx-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              {cartItems.length > 0 && (
                <button type="button" className="cx-clear" data-testid="clear-cart" onClick={clearCart}>
                  Clear
                </button>
              )}
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="cx-empty-wrap">
              <p className="cx-empty" data-testid="cart-empty">Cart is empty</p>
              <p className="cx-empty-hint">Add something from the shop to get started.</p>
            </div>
          ) : (
            <ul className="cx-lines">
              {cartItems.map(({ id, qty, product }) => (
                <li key={id} className="cx-line">
                  <div>
                    <div className="cx-line-name">{product.name}</div>
                    <div className="cx-line-unit">{fmt(product.price)} each</div>
                  </div>
                  <div className="cx-line-total">{fmt((cents(product.price) * qty) / 100)}</div>
                  <div className="cx-line-ctrl">
                    <div className="cx-step">
                      <button
                        type="button"
                        data-testid={`dec-${id}`}
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => decrease(id)}
                      >
                        −
                      </button>
                      <span className="cx-qty" data-testid={`qty-${id}`}>{qty}</span>
                      <button
                        type="button"
                        data-testid={`inc-${id}`}
                        aria-label={`Increase quantity of ${product.name}`}
                        onClick={() => increase(id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cx-remove"
                      data-testid={`remove-${id}`}
                      aria-label={`Remove ${product.name}`}
                      onClick={() => remove(id)}
                    >
                      <TrashIcon /> Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="cx-meter">
            <p className={`cx-meter-msg${hasDiscount ? " is-done" : ""}`}>
              {hasDiscount
                ? `${pct}% discount applied`
                : `Add ${fmt(remaining)} more to get ${pct}% off`}
            </p>
            <div className="cx-bar" role="presentation">
              <i className={hasDiscount ? "is-done" : ""} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="cx-sums" aria-live="polite">
            <div
              data-testid="total"
              className={`cx-total${hasDiscount ? " is-struck" : " is-solo"}`}
            >
              Total: {fmt(total)}
            </div>
            {hasDiscount && (
              <>
                <div data-testid="discount" className="cx-discount">
                  Discount: {fmt(discount)}
                </div>
                <div data-testid="grand-total" className="cx-grand">
                  Grand Total: {fmt(grandTotal)}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
