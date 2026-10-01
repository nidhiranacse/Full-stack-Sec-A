import { useEffect, useReducer, useRef, useState } from "react";
import { ShoppingCart, Search, Plus, Minus, Trash2 } from "lucide-react";
import "./App.css";

// ---------------- PRODUCTS ----------------

const products = [
  { id: 1, name: "Wireless Headphones", price: 2499, category: "Electronics" },
  { id: 2, name: "Smart Watch", price: 3999, category: "Electronics" },
  { id: 3, name: "Running Shoes", price: 2999, category: "Fashion" },
  { id: 4, name: "Backpack", price: 1499, category: "Fashion" },
  { id: 5, name: "Coffee Mug", price: 499, category: "Home" },
  { id: 6, name: "Desk Lamp", price: 999, category: "Home" },
  { id: 7, name: "Bluetooth Speaker", price: 1799, category: "Electronics" },
  { id: 8, name: "Water Bottle", price: 699, category: "Lifestyle" },
  { id: 9, name: "Sunglasses", price: 1299, category: "Fashion" },
  { id: 10, name: "Notebook", price: 299, category: "Stationery" },
  { id: 11, name: "Mechanical Keyboard", price: 3499, category: "Electronics" },
  { id: 12, name: "Study Lamp", price: 1199, category: "Home" },
];

// Simulated API with random delay
function fetchProducts(query, page) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 800) + 100;

    setTimeout(() => {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );

      const pageSize = 4;
      const start = (page - 1) * pageSize;
      const result = filtered.slice(start, start + pageSize);

      resolve({
        data: result,
        total: filtered.length,
      });
    }, delay);
  });
}

// ---------------- CART REDUCER ----------------

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((item) => item.id === action.product.id);

      if (existing) {
        return state.map((item) =>
          item.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...state, { ...action.product, quantity: 1 }];
    }

    case "INCREMENT":
      return state.map((item) =>
        item.id === action.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

    case "DECREMENT":
      return state
        .map((item) =>
          item.id === action.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

    case "REMOVE":
      return state.filter((item) => item.id !== action.id);

    case "LOAD":
      return action.cart;

    default:
      return state;
  }
}

// ---------------- APP ----------------

function App() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("lab12-cart");

    if (savedCart) {
      dispatch({
        type: "LOAD",
        cart: JSON.parse(savedCart),
      });
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("lab12-cart", JSON.stringify(cart));
  }, [cart]);

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchText);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch products
  useEffect(() => {
    const currentRequest = ++requestId.current;

    setLoading(true);

    fetchProducts(query, page).then((result) => {
      // Prevent stale response from overwriting newer request
      if (currentRequest === requestId.current) {
        setItems(result.data);
        setTotal(result.total);
        setLoading(false);
      }
    });
  }, [query, page]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalPages = Math.ceil(total / 4);

  return (
    <div className="app">

      {/* HERO */}
      <section className="hero">
        <div>
          <p className="small-title">LAB SHEET 12 · PROBLEM 3</p>

          <h1>
            Smart Product
            <span> Store</span>
          </h1>

          <p className="hero-text">
            A React shopping interface with debounced search,
            pagination, cart management and persistent storage.
          </p>
        </div>

        <div className="hero-cart">
          <ShoppingCart size={28} />
          <span>{cart.length}</span>
        </div>
      </section>

      {/* SEARCH */}
      <div className="search-box">
        <Search size={21} />

        <input
          id="search-input"
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* MAIN CONTENT */}
      <main>

        <div className="section-heading">
          <div>
            <p className="section-label">PRODUCTS</p>
            <h2>Explore products</h2>
          </div>

          <div className="result-count">
            {total} products
          </div>
        </div>

        {loading && (
          <div className="message">
            <div className="loader"></div>
            Loading products...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="message">
            No results found.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="product-grid">

            {items.map((product) => (
              <div
                className="product-card"
                key={product.id}
                data-testid="product-item"
              >
                <div className="product-image">
                  🛍️
                </div>

                <div className="product-info">
                  <p className="category">
                    {product.category}
                  </p>

                  <h3>{product.name}</h3>

                  <div className="product-bottom">
                    <strong>₹{product.price}</strong>

                    <button
                      id="add-btn"
                      onClick={() =>
                        dispatch({
                          type: "ADD",
                          product,
                        })
                      }
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* PAGINATION */}
        <div className="pagination">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>

          <span>
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            id="next-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>

        </div>

      </main>

      {/* CART */}
      <section className="cart-section">

        <div className="cart-heading">
          <div>
            <p className="section-label">YOUR CART</p>
            <h2>Shopping Cart</h2>
          </div>

          <ShoppingCart size={30} />
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            Your cart is empty. Add some products!
          </div>
        ) : (
          <div className="cart-list">

            {cart.map((item) => (
              <div className="cart-item" key={item.id}>

                <div>
                  <h3>{item.name}</h3>
                  <p>₹{item.price} each</p>
                </div>

                <div className="quantity">

                  <button
                    onClick={() =>
                      dispatch({
                        type: "DECREMENT",
                        id: item.id,
                      })
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      dispatch({
                        type: "INCREMENT",
                        id: item.id,
                      })
                    }
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    className="delete"
                    onClick={() =>
                      dispatch({
                        type: "REMOVE",
                        id: item.id,
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

        <div className="cart-total">
          <span>Total</span>

          <strong id="cart-total">
            ₹{cartTotal}
          </strong>
        </div>

      </section>

      <footer>
        React SPA · Lab Sheet 12 · Problem 3
      </footer>

    </div>
  );
}

export default App;