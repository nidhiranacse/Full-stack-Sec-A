import { useEffect, useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, ArrowUpRight, RefreshCw,
  Plus, Pencil, Trash2, X, CheckCircle2, AlertCircle,
  PackageCheck, ChefHat, Truck, ClipboardList
} from "lucide-react";

import Header from "./components/Header";
import MenuCard from "./components/MenuCard";
import Cart from "./components/Cart";
import {
  getMenu, addMenuItem, updateMenuItem, deleteMenuItem,
  placeOrder, getOrders, updateOrderStatus
} from "./services/api";

const emptyCustomer = {
  customerName: "",
  phone: "",
  address: "",
};

const emptyItem = {
  name: "",
  price: "",
  category: "Main Course",
  isAvailable: true,
};

const nextStatus = {
  Placed: "Preparing",
  Preparing: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong.";
}

export default function App() {
  const [activeTab, setActiveTab] = useState("menu");
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customer, setCustomer] = useState(emptyCustomer);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [notice, setNotice] = useState(null);

  const cartCount = cart.reduce((sum, entry) => sum + entry.qty, 0);
  const cartTotal = cart.reduce(
    (sum, entry) => sum + Number(entry.price) * entry.qty,
    0
  );

  const categories = useMemo(
    () => ["All", ...new Set(menu.map((item) => item.category || "Other"))],
    [menu]
  );

  async function refreshMenu() {
    setLoadingMenu(true);
    try {
      const response = await getMenu({
        search: search.trim(),
        category,
      });
      setMenu(response.data);
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoadingMenu(false);
    }
  }

  async function refreshOrders() {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshMenu();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category]);

  useEffect(() => {
    refreshOrders();
  }, []);

  function showNotice(type, text) {
    setNotice({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(item) {
    if (!item.isAvailable) return;

    setCart((current) => {
      const existing = current.find((entry) => entry._id === item._id);
      if (existing) {
        return current.map((entry) =>
          entry._id === item._id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...current, { ...item, qty: 1 }];
    });

    setNotice({ type: "success", text: `${item.name} added to your cart.` });
  }

  function changeQuantity(id, change) {
    setCart((current) =>
      current
        .map((entry) =>
          entry._id === id ? { ...entry, qty: entry.qty + change } : entry
        )
        .filter((entry) => entry.qty > 0)
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((entry) => entry._id !== id));
  }

  async function checkout() {
    if (!customer.customerName.trim()) {
      return showNotice("error", "Please enter your full name.");
    }
    if (!/^\d{10}$/.test(customer.phone)) {
      return showNotice("error", "Enter a valid 10-digit phone number.");
    }
    if (!customer.address.trim()) {
      return showNotice("error", "Please enter your delivery address.");
    }
    if (cart.length === 0) {
      return showNotice("error", "Your cart is empty.");
    }

    setPlacingOrder(true);
    try {
      const response = await placeOrder({
        ...customer,
        items: cart.map((entry) => ({
          itemId: entry._id,
          qty: entry.qty,
        })),
      });

      setCart([]);
      setCustomer(emptyCustomer);
      await refreshOrders();
      setActiveTab("orders");
      showNotice(
        "success",
        `Order placed successfully! Order ID: ${response.data._id}`
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setPlacingOrder(false);
    }
  }

  function openNewItemForm() {
    setEditingId(null);
    setItemForm(emptyItem);
    setShowItemForm(true);
  }

  function openEditItemForm(item) {
    setEditingId(item._id);
    setItemForm({
      name: item.name,
      price: String(item.price),
      category: item.category || "Other",
      isAvailable: item.isAvailable,
    });
    setShowItemForm(true);
  }

  async function saveMenuItem(event) {
    event.preventDefault();

    if (!itemForm.name.trim() || !Number.isFinite(Number(itemForm.price)) ||
        Number(itemForm.price) <= 0) {
      return showNotice("error", "Enter an item name and a positive price.");
    }

    const payload = {
      ...itemForm,
      name: itemForm.name.trim(),
      price: Number(itemForm.price),
    };

    try {
      if (editingId) {
        await updateMenuItem(editingId, payload);
        showNotice("success", "Menu item updated successfully.");
      } else {
        await addMenuItem(payload);
        showNotice("success", "Menu item added successfully.");
      }

      setShowItemForm(false);
      setItemForm(emptyItem);
      setEditingId(null);
      await refreshMenu();
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    }
  }

  async function removeMenuItem(item) {
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;

    try {
      await deleteMenuItem(item._id);
      setCart((current) => current.filter((entry) => entry._id !== item._id));
      showNotice("success", "Menu item deleted.");
      await refreshMenu();
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    }
  }

  async function changeOrderStatus(order, status) {
    try {
      await updateOrderStatus(order._id, status);
      await refreshOrders();
      showNotice("success", `Order status updated to ${status}.`);
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    }
  }

  const statusIcon = {
    Placed: PackageCheck,
    Preparing: ChefHat,
    "Out for Delivery": Truck,
    Delivered: CheckCircle2,
    Cancelled: X,
  };

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
      />

      <main className="page-container">
        {notice && (
          <div className={`notice ${notice.type}`} role="status">
            {notice.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notice.text}</span>
            <button aria-label="Dismiss message" onClick={() => setNotice(null)}>
              <X size={17} />
            </button>
          </div>
        )}

        {activeTab === "menu" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow hero-eyebrow">A LITTLE TASTE OF HAPPINESS</span>
                <h1>Good food.<br />Great <span>mood.</span></h1>
                <p>Discover your next favourite meal. Freshly prepared, easy to order, delivered with care.</p>
                <button
                  className="primary-button hero-button"
                  onClick={() => document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Explore the menu <ArrowUpRight size={18} />
                </button>
                <div className="hero-stats">
                  <div><strong>{menu.length}+</strong><span>Menu options</span></div>
                  <div><strong>Fresh</strong><span>Made to order</span></div>
                  <div><strong>Easy</strong><span>Online ordering</span></div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-orbit orbit-one" />
                <div className="hero-orbit orbit-two" />
                <div className="hero-food">🍔</div>
                <span className="floating-food food-one">🍟</span>
                <span className="floating-food food-two">🥤</span>
                <div className="hero-sticker">MADE WITH<br />LOVE <span>♥</span></div>
                <div className="hero-caption"><span className="live-dot" /> Goodness on the way</div>
              </div>
            </section>

            <section className="menu-layout" id="menu-section">
              <div className="menu-main">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">THE GOOD STUFF</span>
                    <h2>Explore our menu<span className="heading-dot">.</span></h2>
                    <p>Find something delicious for every craving.</p>
                  </div>
                  <span className="menu-count">{menu.length} items</span>
                </div>

                <div className="menu-tools">
                  <div className="search-box">
                    <Search size={19} />
                    <input
                      aria-label="Search menu"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search dishes..."
                    />
                    {search && <button onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}
                  </div>
                  <div className="filter-label"><SlidersHorizontal size={16} /> Filter</div>
                </div>

                <div className="category-list">
                  {categories.map((entry) => (
                    <button
                      key={entry}
                      className={`category-chip ${category === entry ? "selected" : ""}`}
                      onClick={() => setCategory(entry)}
                    >
                      {entry === "All" ? "🍽️" : "•"} {entry}
                    </button>
                  ))}
                </div>

                {loadingMenu ? (
                  <div className="state-message"><RefreshCw className="spin" size={23} /> Loading the menu...</div>
                ) : menu.length === 0 ? (
                  <div className="state-message empty-menu">
                    <span>🍜</span>
                    <h3>No dishes found</h3>
                    <p>Try another search, or add menu items from the Admin panel.</p>
                    <button className="secondary-button" onClick={() => { setSearch(""); setCategory("All"); }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="menu-grid">
                    {menu.map((item) => (
                      <MenuCard
                        key={item._id}
                        item={item}
                        quantity={cart.find((entry) => entry._id === item._id)?.qty || 0}
                        onAdd={addToCart}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Cart
                cart={cart}
                onChangeQty={changeQuantity}
                onRemove={removeFromCart}
                customer={customer}
                setCustomer={setCustomer}
                onCheckout={checkout}
                loading={placingOrder}
              />
            </section>
          </>
        )}

        {activeTab === "orders" && (
          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR FOOD JOURNEY</span>
                <h2>Order history<span className="heading-dot">.</span></h2>
                <p>All your recent QuickBite orders, in one place.</p>
              </div>
              <button className="secondary-button" onClick={refreshOrders}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="state-message empty-menu">
                <ClipboardList size={36} />
                <h3>No orders yet</h3>
                <p>Your next delicious meal is just a few clicks away.</p>
                <button className="primary-button" onClick={() => setActiveTab("menu")}>Browse menu <ArrowUpRight size={17} /></button>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => {
                  const Icon = statusIcon[order.status] || PackageCheck;
                  return (
                    <article className="order-card" key={order._id}>
                      <div className="order-card-header">
                        <div>
                          <span className="eyebrow">ORDER ID</span>
                          <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                        </div>
                        <span className={`status-badge status-${order.status.toLowerCase().replaceAll(" ", "-")}`}>
                          <Icon size={14} /> {order.status}
                        </span>
                      </div>
                      <div className="order-meta">
                        <span>{order.customerName}</span>
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="order-food-list">
                        {order.items.map((item, index) => (
                          <div key={`${item.itemId}-${index}`}>
                            <span>{item.name} <b>× {item.qty}</b></span>
                            <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="order-total">
                        <span>Total amount</span>
                        <strong>₹{Number(order.totalAmount).toFixed(2)}</strong>
                      </div>
                      {order.status === "Placed" && (
                        <button className="cancel-order" onClick={() => changeOrderStatus(order, "Cancelled")}>
                          Cancel order
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "admin" && (
          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">RESTAURANT CONTROL CENTRE</span>
                <h2>Manage QuickBite<span className="heading-dot">.</span></h2>
                <p>Manage menu availability, prices, and incoming orders.</p>
              </div>
              <button className="primary-button" onClick={openNewItemForm}>
                <Plus size={18} /> Add menu item
              </button>
            </div>

            {showItemForm && (
              <form className="admin-form" onSubmit={saveMenuItem}>
                <div className="admin-form-heading">
                  <h3>{editingId ? "Edit menu item" : "Add a new item"}</h3>
                  <button type="button" className="icon-button" onClick={() => setShowItemForm(false)} aria-label="Close form"><X size={18} /></button>
                </div>
                <div className="admin-form-grid">
                  <label>Item name
                    <input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
                  </label>
                  <label>Price (₹)
                    <input type="number" min="0.01" step="0.01" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
                  </label>
                  <label>Category
                    <input value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} required />
                  </label>
                  <label className="availability-toggle">
                    <input type="checkbox" checked={itemForm.isAvailable} onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })} />
                    Available to order
                  </label>
                </div>
                <div className="form-actions">
                  <button className="primary-button" type="submit">{editingId ? "Save changes" : "Create item"}</button>
                  <button className="secondary-button" type="button" onClick={() => setShowItemForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="admin-subheading"><h3>Menu items</h3><span>{menu.length} listed</span></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead>
                <tbody>
                  {menu.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category || "Other"}</td>
                      <td>₹{Number(item.price).toFixed(2)}</td>
                      <td><span className={`availability-pill ${item.isAvailable ? "available" : "not-available"}`}>{item.isAvailable ? "Available" : "Unavailable"}</span></td>
                      <td className="table-actions">
                        <button className="icon-button" onClick={() => openEditItemForm(item)} title="Edit item"><Pencil size={16} /></button>
                        <button className="icon-button danger-icon" onClick={() => removeMenuItem(item)} title="Delete item"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {menu.length === 0 && <tr><td colSpan="5" className="table-empty">No menu items found. Add your first item above.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="admin-subheading orders-subheading"><h3>Incoming orders</h3><span>{orders.length} total</span></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-8).toUpperCase()}</td>
                      <td>{order.customerName}</td>
                      <td>₹{Number(order.totalAmount).toFixed(2)}</td>
                      <td><span className={`status-badge status-${order.status.toLowerCase().replaceAll(" ", "-")}`}>{order.status}</span></td>
                      <td>
                        {nextStatus[order.status] ? (
                          <button className="small-action" onClick={() => changeOrderStatus(order, nextStatus[order.status])}>
                            Advance to {nextStatus[order.status]} <ArrowUpRight size={14} />
                          </button>
                        ) : <span className="muted-text">No further action</span>}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="5" className="table-empty">No orders received yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-brand">quick<span>bite</span><small>GOOD FOOD, GOOD MOOD</small></div>
        <p>Made for your cravings. Served with care.</p>
        <span>© {new Date().getFullYear()} QuickBite</span>
      </footer>
    </div>
  );
}
