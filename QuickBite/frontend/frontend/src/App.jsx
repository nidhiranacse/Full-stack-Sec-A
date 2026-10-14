import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: "",
    price: "",
    category: "Main Course",
    isAvailable: true,
  });
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  const [customer, setCustomer] = useState({
    customerName: "",
    phone: "",
    address: "",
  });

  async function loadMenu() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/items`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load the menu.");
      }

      setItems(data.items);
    } catch (err) {
      setError(err.message || "Unable to connect to QuickBite.");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load orders.");
      }

      setOrders(data.orders);
    } catch (err) {
      setMessage(err.message || "Could not load order history.");
    }
  }

  useEffect(() => {
    loadMenu();
    loadOrders();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(search.trim().toLowerCase());

        return (
          matchesSearch && (category === "All" || item.category === category)
        );
      }),
    [items, search, category],
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  function addToCart(item) {
    if (!item.isAvailable) return;

    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);

      return existing
        ? current.map((entry) =>
            entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry,
          )
        : [...current, { ...item, qty: 1 }];
    });

    setMessage(`${item.name} added to your cart.`);
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + amount } : item,
        )
        .filter((item) => item.qty > 0),
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function updateCustomer(event) {
    const { name, value } = event.target;

    setCustomer((current) => ({
      ...current,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  }

  async function placeOrder(event) {
    event.preventDefault();
    setMessage("");

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    if (!customer.customerName.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!/^\d{10}$/.test(customer.phone)) {
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!customer.address.trim()) {
      setMessage("Please enter your delivery address.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          items: cart.map((item) => ({
            itemId: item.id,
            qty: item.qty,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place order.");
      }

      setMessage(
        `Order #${data.order.id} placed successfully! Total: ₹${Number(
          data.order.totalAmount,
        ).toFixed(2)}`,
      );

      setCart([]);
      setCheckoutOpen(false);
      setCustomer({ customerName: "", phone: "", address: "" });

      await loadOrders();
      document.getElementById("orders")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (err) {
      setMessage(err.message || "Unable to place your order.");
      await loadMenu();
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelOrder(orderId) {
    try {
      setMessage("");

      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel order.");
      }

      setMessage(`Order #${orderId} cancelled successfully.`);
      await loadOrders();
    } catch (err) {
      setMessage(err.message || "Unable to cancel order.");
    }
  }

  function statusClass(status) {
    return `status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`;
  }

  function resetAdminForm() {
    setEditingId(null);
    setAdminForm({
      name: "",
      price: "",
      category: "Main Course",
      isAvailable: true,
    });
    setAdminError("");
  }

  function editMenuItem(item) {
    setEditingId(item.id);
    setAdminForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setAdminError("");
    setAdminSuccess("");
    setAdminOpen(true);

    document.getElementById("admin")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  async function saveMenuItem(event) {
    event.preventDefault();
    setAdminError("");
    setAdminSuccess("");

    const price = Number(adminForm.price);

    if (!adminForm.name.trim()) {
      setAdminError("Item name is required.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setAdminError("Price must be greater than zero.");
      return;
    }

    if (!adminForm.category.trim()) {
      setAdminError("Category is required.");
      return;
    }

    const isEditing = editingId !== null;
    const url = isEditing
      ? `${API_URL}/items/${editingId}`
      : `${API_URL}/items`;

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adminForm,
          name: adminForm.name.trim(),
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save menu item.");
      }

      setAdminSuccess(isEditing ? "Menu item updated." : "Menu item added.");

      resetAdminForm();
      await loadMenu();
    } catch (err) {
      setAdminError(err.message || "Could not save menu item.");
    }
  }

  async function deleteMenuItem(item) {
    const confirmed = window.confirm(`Delete "${item.name}" from the menu?`);

    if (!confirmed) return;

    setAdminError("");
    setAdminSuccess("");

    try {
      const response = await fetch(`${API_URL}/items/${item.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete menu item.");
      }

      setCart((current) =>
        current.filter((cartItem) => cartItem.id !== item.id),
      );

      setAdminSuccess("Menu item deleted.");
      await loadMenu();
    } catch (err) {
      setAdminError(err.message || "Could not delete menu item.");
    }
  }

  async function advanceOrder(order) {
    const nextStatus = {
      Placed: "Preparing",
      Preparing: "Out for Delivery",
      "Out for Delivery": "Delivered",
    }[order.status];

    if (!nextStatus) return;

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update order.");
      }

      setMessage(`Order #${order.id} is now ${nextStatus}.`);
      await loadOrders();
    } catch (err) {
      setMessage(err.message || "Could not update order.");
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">Q</span>
          QuickBite<span className="brand-dot">.</span>
        </a>

        <nav>
          <a href="#menu">Menu</a>
          <a href="#cart">My Cart ({cartCount})</a>
          <a href="#orders">Orders</a>
          <a href="#admin">Admin</a>
        </nav>

        <a href="#cart" className="nav-button">
          View Cart
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">FRESH FOOD · FAST DELIVERY</span>
            <h1>
              Good food.
              <br />
              <span>Good mood.</span>
            </h1>
            <p>
              Your favourite meals, freshly prepared and delivered straight to
              your door.
            </p>
            <a href="#menu" className="primary-button">
              Explore Menu <span>→</span>
            </a>
            <div className="hero-note">
              <span>✓</span> Freshly prepared · Easy ordering
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-circle">
              <span className="food-emoji">🍕</span>
              <span className="floating-food food-one">🍔</span>
              <span className="floating-food food-two">🍟</span>
              <span className="floating-food food-three">🥤</span>
            </div>
            <div className="hero-label">
              <span>✦</span> Made with love
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE OUR MENU</span>
              <h2>What are you craving?</h2>
              <p>Discover something delicious today.</p>
            </div>
            <button className="refresh-button" onClick={loadMenu}>
              ↻ Refresh menu
            </button>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search your favourite food..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value === "All" ? "All categories" : value}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div className="success-message" role="status">
              {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
              <button onClick={loadMenu}>Try again</button>
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <p>Loading menu...</p>
            </div>
          ) : !error && filteredItems.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <h3>No food found</h3>
              <p>Try another search or category.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <article className="food-card" key={item.id}>
                  <div className="food-card-top">
                    <span className="food-card-emoji">
                      {item.name.toLowerCase().includes("pizza")
                        ? "🍕"
                        : item.name.toLowerCase().includes("burger")
                          ? "🍔"
                          : item.name.toLowerCase().includes("cake")
                            ? "🍰"
                            : "🍴"}
                    </span>
                    <span
                      className={`availability ${
                        item.isAvailable ? "available" : "unavailable"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Sold out"}
                    </span>
                  </div>

                  <div className="food-card-body">
                    <span className="food-category">{item.category}</span>
                    <h3>{item.name}</h3>
                    <div className="food-card-footer">
                      <span className="price">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                      <button
                        className="add-button"
                        disabled={!item.isAvailable}
                        onClick={() => addToCart(item)}
                      >
                        {item.isAvailable ? "+ Add" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="cart-section" id="cart">
          <div className="cart-heading">
            <div>
              <span className="eyebrow">YOUR SELECTION</span>
              <h2>Your shopping cart</h2>
            </div>
            <span className="cart-count">{cartCount} items</span>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <span>🛒</span>
              <div>
                <h3>Your cart is waiting</h3>
                <p>Add something delicious from our menu.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>₹{Number(item.price).toFixed(2)} each</p>
                    </div>
                    <div className="quantity-control">
                      <button onClick={() => changeQuantity(item.id, -1)}>
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => changeQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                    <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                    <button
                      className="remove-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div>
                  <span>Estimated subtotal</span>
                  <strong>₹{cartTotal.toFixed(2)}</strong>
                </div>
                <p>The final amount is calculated by the server at checkout.</p>
                <button
                  className="primary-button checkout-button"
                  onClick={() => setCheckoutOpen(!checkoutOpen)}
                >
                  {checkoutOpen ? "Close Checkout" : "Continue to Checkout →"}
                </button>

                {checkoutOpen && (
                  <form className="checkout-form" onSubmit={placeOrder}>
                    <h3>Delivery details</h3>

                    <label>
                      Full name
                      <input
                        name="customerName"
                        value={customer.customerName}
                        onChange={updateCustomer}
                        required
                        maxLength={100}
                        placeholder="Enter your name"
                      />
                    </label>

                    <label>
                      Phone number
                      <input
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        value={customer.phone}
                        onChange={updateCustomer}
                        pattern="[0-9]{10}"
                        required
                        placeholder="10-digit phone number"
                      />
                    </label>

                    <label>
                      Delivery address
                      <textarea
                        name="address"
                        value={customer.address}
                        onChange={updateCustomer}
                        required
                        maxLength={500}
                        placeholder="Enter your complete address"
                        rows={3}
                      />
                    </label>

                    <button
                      type="submit"
                      className="primary-button checkout-button"
                      disabled={submitting}
                    >
                      {submitting ? "Placing order..." : "Place Order"}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </section>

        <section className="orders-section" id="orders">
          <div className="cart-heading">
            <div>
              <span className="eyebrow">ORDER HISTORY</span>
              <h2>Your orders</h2>
            </div>
            <button className="refresh-button" onClick={loadOrders}>
              ↻ Refresh orders
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="cart-empty">
              <span>🧾</span>
              <div>
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-card-heading">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p>
                        {order.customerName} · {order.phone}
                      </p>
                    </div>
                    <span className={statusClass(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <p className="order-address">{order.address}</p>

                  <div className="order-products">
                    {order.items.map((item) => (
                      <div key={item.itemId}>
                        <span>
                          {item.name} × {item.qty}
                        </span>
                        <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <span>
                      {new Date(
                        order.createdAt.replace(" ", "T") + "Z",
                      ).toLocaleString()}
                    </span>
                    <strong>
                      Total: ₹{Number(order.totalAmount).toFixed(2)}
                    </strong>
                  </div>

                  {order.status === "Placed" && (
                    <button
                      className="cancel-order-button"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

<section className="admin-section" id="admin">
  <div className="section-heading">
    <div>
      <span className="eyebrow">RESTAURANT MANAGEMENT</span>
      <h2>Admin Dashboard</h2>
      <p>Manage menu items and fulfil customer orders.</p>
    </div>

    <button
      className="primary-button"
      onClick={() => {
        resetAdminForm();
        setAdminOpen(!adminOpen);
      }}
    >
      {adminOpen ? "Close Form" : "+ Add Menu Item"}
    </button>
  </div>

  {adminOpen && (
    <form className="admin-form" onSubmit={saveMenuItem}>
      <h3>{editingId ? "Edit Menu Item" : "Add Menu Item"}</h3>

      <label>
        Item name
        <input
          required
          maxLength={100}
          value={adminForm.name}
          onChange={(event) =>
            setAdminForm({
              ...adminForm,
              name: event.target.value,
            })
          }
          placeholder="e.g. Veg Burger"
        />
      </label>

      <label>
        Price (₹)
        <input
          type="number"
          min="0.01"
          step="0.01"
          required
          value={adminForm.price}
          onChange={(event) =>
            setAdminForm({
              ...adminForm,
              price: event.target.value,
            })
          }
          placeholder="e.g. 149"
        />
      </label>

      <label>
        Category
        <select
          value={adminForm.category}
          onChange={(event) =>
            setAdminForm({
              ...adminForm,
              category: event.target.value,
            })
          }
        >
          <option>Starters</option>
          <option>Main Course</option>
          <option>Desserts</option>
          <option>Drinks</option>
        </select>
      </label>

      <label className="availability-checkbox">
        <input
          type="checkbox"
          checked={adminForm.isAvailable}
          onChange={(event) =>
            setAdminForm({
              ...adminForm,
              isAvailable: event.target.checked,
            })
          }
        />
        Available for ordering
      </label>

      <div className="admin-form-actions">
        <button className="primary-button" type="submit">
          {editingId ? "Save Changes" : "Create Item"}
        </button>
        <button
          type="button"
          className="refresh-button"
          onClick={resetAdminForm}
        >
          Reset
        </button>
      </div>
    </form>
  )}

  {adminError && (
    <p className="error-message" role="alert">{adminError}</p>
  )}

  {adminSuccess && (
    <p className="success-message" role="status">{adminSuccess}</p>
  )}

  <h3 className="admin-subheading">Menu Management</h3>

  <div className="admin-table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Category</th>
          <th>Price</th>
          <th>Availability</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.category}</td>
            <td>₹{Number(item.price).toFixed(2)}</td>
            <td>
              {item.isAvailable ? "Available" : "Unavailable"}
            </td>
            <td>
              <div className="admin-row-actions">
                <button onClick={() => editMenuItem(item)}>
                  Edit
                </button>
                <button
                  onClick={() =>
                    saveAvailability(item, !item.isAvailable)
                  }
                >
                  {item.isAvailable ? "Mark unavailable" : "Mark available"}
                </button>
                <button
                  className="danger-button"
                  onClick={() => deleteMenuItem(item)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <h3 className="admin-subheading">Order Management</h3>

  <div className="orders-list">
    {orders.map((order) => {
      const nextStatus = {
        Placed: "Preparing",
        Preparing: "Out for Delivery",
        "Out for Delivery": "Delivered",
      }[order.status];

      return (
        <article className="order-card" key={order.id}>
          <div className="order-card-heading">
            <div>
              <h3>Order #{order.id}</h3>
              <p>{order.customerName} · {order.phone}</p>
            </div>
            <span className={statusClass(order.status)}>
              {order.status}
            </span>
          </div>

          <p className="order-address">{order.address}</p>

          <div className="order-card-footer">
            <span>{order.items.length} item type(s)</span>
            <strong>₹{Number(order.totalAmount).toFixed(2)}</strong>
          </div>

          {nextStatus && (
            <button
              className="primary-button"
              onClick={() => advanceOrder(order)}
            >
              Advance to {nextStatus}
            </button>
          )}

          {order.status === "Placed" && (
            <button
              className="cancel-order-button"
              onClick={() => cancelOrder(order.id)}
            >
              Cancel Order
            </button>
          )}
        </article>
      );
    })}
  </div>
</section>

      </main>

      <footer className="footer">
        <a href="#" className="brand">
          <span className="brand-icon">Q</span>
          QuickBite<span className="brand-dot">.</span>
        </a>
        <p>Good food brings people together.</p>
        <span>© 2026 QuickBite</span>
      </footer>
    </div>
  );
}

export default App;
