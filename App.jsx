import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const [orders, setOrders] = useState([]);

  const [adminName, setAdminName] = useState("");
  const [adminPrice, setAdminPrice] = useState("");
  const [adminCategory, setAdminCategory] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchOrders();
  }, [search, category]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (category) {
        params.append("category", category);
      }

      const response = await fetch(`${API_URL}/items?${params}`);
      const data = await response.json();

      setItems(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();

      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(
      (cartItem) => cartItem._id === item._id
    );

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? {
              ...cartItem,
              qty: cartItem.qty + 1
            }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          qty: 1
        }
      ]);
    }
  };

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item._id === id
          ? {
            ...item,
            qty: item.qty + 1
          }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item._id === id
            ? {
              ...item,
              qty: item.qty - 1
            }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(
      cart.filter((item) => item._id !== id)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const placeOrder = async () => {
    if (!customerName || !phone || !address) {
      setMessage("Please fill all checkout fields.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setMessage(
        "Phone must contain exactly 10 digits."
      );
      return;
    }

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customerName,
            phone,
            address,
            items: cart.map((item) => ({
              itemId: item._id,
              qty: item.qty
            }))
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Order failed."
        );
        return;
      }

      setMessage(
        `Order placed successfully! Total: ₹${data.totalAmount}`
      );

      setCart([]);
      setCustomerName("");
      setPhone("");
      setAddress("");

      fetchOrders();
    } catch (error) {
      setMessage("Unable to place order.");
    }
  };

  const cancelOrder = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: "Cancelled"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
          "Unable to cancel order."
        );
        return;
      }

      setMessage(
        "Order cancelled successfully."
      );

      fetchOrders();
    } catch (error) {
      setMessage(
        "Unable to cancel order."
      );
    }
  };

  const saveMenuItem = async () => {
    if (
      !adminName ||
      !adminPrice ||
      !adminCategory
    ) {
      setMessage(
        "Please fill all menu item fields."
      );
      return;
    }

    if (Number(adminPrice) <= 0) {
      setMessage(
        "Price must be greater than 0."
      );
      return;
    }

    const itemData = {
      name: adminName,
      price: Number(adminPrice),
      category: adminCategory,
      isAvailable: true
    };

    try {
      const url = editingId
        ? `${API_URL}/items/${editingId}`
        : `${API_URL}/items`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(itemData)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
          "Unable to save menu item."
        );
        return;
      }

      if (editingId) {
        setMessage(
          "Menu item updated successfully."
        );
      } else {
        setMessage(
          "Menu item added successfully."
        );
      }

      setAdminName("");
      setAdminPrice("");
      setAdminCategory("");
      setEditingId(null);

      fetchItems();
    } catch (error) {
      setMessage(
        "Unable to save menu item."
      );
    }
  };

  const editMenuItem = (item) => {
    setEditingId(item._id);
    setAdminName(item.name);
    setAdminPrice(item.price);
    setAdminCategory(item.category);
  };

  const advanceOrderStatus = async (order) => {
    const statusFlow = [
      "Placed",
      "Preparing",
      "Out for Delivery",
      "Delivered"
    ];

    const currentIndex =
      statusFlow.indexOf(order.status);

    if (
      currentIndex === -1 ||
      currentIndex ===
      statusFlow.length - 1
    ) {
      return;
    }

    const nextStatus =
      statusFlow[currentIndex + 1];

    try {
      const response = await fetch(
        `${API_URL}/orders/${order._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: nextStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
          "Unable to update order."
        );
        return;
      }

      setMessage(
        "Order status updated."
      );

      fetchOrders();
    } catch (error) {
      setMessage(
        "Unable to update order."
      );
    }
  };

  const categories = [
    ...new Set(
      items.map((item) => item.category)
    )
  ];

  return (
    <div className="app">

      <header>
        <h1>QuickBite</h1>
        <p>
          Fast food delivery made simple
        </p>
      </header>

      <main>

        {/* MENU */}

        <section className="menu-section">

          <h2>Menu</h2>

          <div className="filters">

            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >

              <option value="">
                All Categories
              </option>

              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              ))}

            </select>

          </div>

          <div className="menu-grid">

            {items.map((item) => (

              <div
                className="menu-card"
                key={item._id}
              >

                <h3>{item.name}</h3>

                <p>{item.category}</p>

                <strong>
                  ₹{item.price}
                </strong>

                <button
                  disabled={!item.isAvailable}
                  onClick={() =>
                    addToCart(item)
                  }
                >
                  {item.isAvailable
                    ? "Add to Cart"
                    : "Unavailable"}
                </button>

              </div>

            ))}

          </div>

        </section>


        {/* CART */}

        <section className="cart-section">

          <h2>Cart</h2>

          {cart.length === 0 ? (

            <p>
              Your cart is empty.
            </p>

          ) : (

            <>

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item._id}
                >

                  <div>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      ₹{item.price} × {item.qty}
                    </p>

                  </div>

                  <div className="quantity">

                    <button
                      onClick={() =>
                        decreaseQty(item._id)
                      }
                    >
                      -
                    </button>

                    <span>
                      {item.qty}
                    </span>

                    <button
                      onClick={() =>
                        increaseQty(item._id)
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item._id)
                    }
                  >
                    Remove
                  </button>

                </div>

              ))}

              <h3>
                Total: ₹{total}
              </h3>

            </>

          )}

        </section>


        {/* CHECKOUT */}

        <section className="checkout-section">

          <h2>Checkout</h2>

          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="10-digit Phone"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          <textarea
            placeholder="Delivery Address"
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
          />

          <button
            onClick={placeOrder}
          >
            Place Order
          </button>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

        </section>


        {/* ORDERS */}

        <section className="orders-section">

          <h2>Orders</h2>

          {orders.length === 0 ? (

            <p>
              No orders found.
            </p>

          ) : (

            orders.map((order) => (

              <div
                className="order-card"
                key={order._id}
              >

                <h3>
                  Order #
                  {order._id.slice(-6)}
                </h3>

                <p>
                  <strong>
                    Customer:
                  </strong>{" "}
                  {order.customerName}
                </p>

                <p>
                  <strong>
                    Address:
                  </strong>{" "}
                  {order.address}
                </p>

                <p>
                  <strong>
                    Total:
                  </strong>{" "}
                  ₹{order.totalAmount}
                </p>

                <span
                  className={`status ${order.status
                    .toLowerCase()
                    .replaceAll(
                      " ",
                      "-"
                    )}`}
                >
                  {order.status}
                </span>

                {order.status ===
                  "Placed" && (

                    <button
                      onClick={() =>
                        cancelOrder(
                          order._id
                        )
                      }
                    >
                      Cancel Order
                    </button>

                  )}

              </div>

            ))

          )}

        </section>


        {/* ADMIN */}

        <section className="admin-section">

          <h2>Admin</h2>

          <input
            type="text"
            placeholder="Item Name"
            value={adminName}
            onChange={(e) =>
              setAdminName(
                e.target.value
              )
            }
          />

          <input
            type="number"
            placeholder="Price"
            value={adminPrice}
            onChange={(e) =>
              setAdminPrice(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Category"
            value={adminCategory}
            onChange={(e) =>
              setAdminCategory(
                e.target.value
              )
            }
          />

          <button
            onClick={saveMenuItem}
          >
            {editingId
              ? "Update Item"
              : "Add Item"}
          </button>

          {editingId && (

            <button
              onClick={() => {
                setEditingId(null);
                setAdminName("");
                setAdminPrice("");
                setAdminCategory("");
              }}
            >
              Cancel Edit
            </button>

          )}

          <h3>
            Manage Menu
          </h3>

          {items.map((item) => (

            <div
              className="admin-item"
              key={item._id}
            >

              <span>
                {item.name} - ₹{item.price}
              </span>

              <button
                onClick={() =>
                  editMenuItem(item)
                }
              >
                Edit
              </button>

            </div>

          ))}

          <h3>
            Manage Orders
          </h3>

          {orders.map((order) => (

            <div
              className="admin-item"
              key={order._id}
            >

              <span>
                #{order._id.slice(-6)}
                {" - "}
                {order.status}
              </span>

              {order.status !==
                "Delivered" &&
                order.status !==
                "Cancelled" && (

                  <button
                    onClick={() =>
                      advanceOrderStatus(
                        order
                      )
                    }
                  >
                    Advance Status
                  </button>

                )}

            </div>

          ))}

        </section>

      </main>

    </div>
  );
}

export default App;