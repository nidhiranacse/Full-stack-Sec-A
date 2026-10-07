import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState
} from "react";

import "./App.css";

/* PRODUCTS */

const products = [
  { id: 1, name: "Apple iPhone 15", price: 70000 },
  { id: 2, name: "Samsung Galaxy S24", price: 65000 },
  { id: 3, name: "OnePlus 12", price: 55000 },
  { id: 4, name: "Google Pixel 8", price: 60000 },
  { id: 5, name: "MacBook Air", price: 100000 },
  { id: 6, name: "Dell Laptop", price: 75000 },
  { id: 7, name: "Sony Headphones", price: 12000 },
  { id: 8, name: "Apple Watch", price: 35000 },
  { id: 9, name: "iPad Air", price: 55000 },
  { id: 10, name: "Samsung Tablet", price: 30000 },
  { id: 11, name: "Wireless Mouse", price: 1200 },
  { id: 12, name: "Mechanical Keyboard", price: 3500 }
];

/* MOCK API */

function fetchProducts(query, page) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );

      const pageSize = 4;
      const totalPages = Math.ceil(filtered.length / pageSize);

      const start = (page - 1) * pageSize;

      resolve({
        products: filtered.slice(start, start + pageSize),
        totalPages
      });
    }, Math.random() * 700 + 100);
  });
}

/* CART REDUCER */

function cartReducer(state, action) {
  if (action.type === "ADD") {
    const p = action.product;

    return {
      ...state,
      [p.id]: {
        ...p,
        quantity: (state[p.id]?.quantity || 0) + 1
      }
    };
  }

  if (action.type === "PLUS") {
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        quantity: state[action.id].quantity + 1
      }
    };
  }

  if (action.type === "MINUS") {
    const item = state[action.id];

    if (item.quantity <= 1) {
      const copy = { ...state };
      delete copy[action.id];
      return copy;
    }

    return {
      ...state,
      [action.id]: {
        ...item,
        quantity: item.quantity - 1
      }
    };
  }

  return state;
}

/* CONTEXT */

const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    {},
    () => JSON.parse(localStorage.getItem("cart") || "{}")
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ cart, dispatch, total }}>
      {children}
    </CartContext.Provider>
  );
}

/* PRODUCT */

function ProductCard({ product }) {
  const { dispatch } = useContext(CartContext);

  return (
    <div className="product" data-testid="product-item">
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>

      <button
        data-testid="add-btn"
        onClick={() =>
          dispatch({
            type: "ADD",
            product
          })
        }
      >
        Add to cart
      </button>
    </div>
  );
}

/* CART */

function Cart() {
  const { cart, dispatch, total } = useContext(CartContext);

  return (
    <div className="cart">
      <h2>Cart</h2>

      {Object.values(cart).map((item) => (
        <div className="cart-item" key={item.id}>
          <span>{item.name}</span>

          <button
            onClick={() =>
              dispatch({
                type: "MINUS",
                id: item.id
              })
            }
          >
            -
          </button>

          <span>{item.quantity}</span>

          <button
            onClick={() =>
              dispatch({
                type: "PLUS",
                id: item.id
              })
            }
          >
            +
          </button>
        </div>
      ))}

      {Object.values(cart).length === 0 && (
        <p>Cart is empty</p>
      )}

      <h3 data-testid="cart-total">
        Cart Total: ₹{total}
      </h3>
    </div>
  );
}

/* APP */

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);

  /* Reset page when query changes */

  useEffect(() => {
    setPage(1);
  }, [query]);

  /* Debounce + stale response protection */

  useEffect(() => {
    const id = ++requestId.current;

    setLoading(true);

    const timer = setTimeout(() => {
      fetchProducts(query, page).then((result) => {
        if (id !== requestId.current) return;

        setItems(result.products);
        setTotalPages(result.totalPages || 1);
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, page]);

  return (
    <CartProvider>
      <div className="container">

        <h1>React Product Search</h1>

        <input
          data-testid="search-input"
          className="search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading && <p>Loading...</p>}

        {!loading && items.length === 0 && (
          <p>No results</p>
        )}

        <div className="products">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        <div className="pagination">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            data-testid="next-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>

        </div>

        <Cart />

      </div>
    </CartProvider>
  );
}

/* VERY IMPORTANT */

export default App;