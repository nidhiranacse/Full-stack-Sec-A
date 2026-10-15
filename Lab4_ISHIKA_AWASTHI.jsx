import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams
} from "react-router-dom";

const styles = `
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#1f2937}
nav{background:#2563eb;color:white;padding:16px 8%;display:flex;justify-content:space-between;align-items:center}
.logo{font-size:23px;font-weight:bold}
.links{display:flex;gap:22px}
.links a{color:white;text-decoration:none;font-weight:600}
.page{max-width:1100px;margin:auto;padding:45px 20px}
.hero{text-align:center;background:white;padding:70px 25px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.07)}
.hero h1{font-size:42px;color:#2563eb}
.button{display:inline-block;background:#2563eb;color:white;padding:11px 17px;border:0;border-radius:8px;text-decoration:none;cursor:pointer;font-weight:600;margin:5px}
.secondary{background:#64748b}
.danger{background:#dc2626}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.card{background:white;padding:24px;border-radius:14px;box-shadow:0 5px 20px rgba(0,0,0,.07)}
.card h2{color:#2563eb}
.category{color:#64748b}
.details{max-width:650px;margin:auto;background:white;padding:35px;border-radius:15px;box-shadow:0 5px 20px rgba(0,0,0,.08)}
.cart-item{background:white;padding:18px;margin:10px 0;border-radius:10px;display:flex;justify-content:space-between;align-items:center}
.total{text-align:right;margin-top:25px}
.loading{text-align:center;padding:120px 20px}
.spinner{width:50px;height:50px;border:5px solid #dbeafe;border-top-color:#2563eb;border-radius:50%;animation:spin 1s linear infinite;margin:auto}
@keyframes spin{to{transform:rotate(360deg)}}
.notfound{text-align:center;padding:100px 20px}
.notfound h1{font-size:100px;color:#2563eb;margin:0}
@media(max-width:750px){.grid{grid-template-columns:1fr}.links{gap:10px;flex-wrap:wrap;justify-content:center}nav{flex-direction:column;gap:12px}}
`;

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 65000,
    category: "Electronics",
    description: "A powerful laptop for programming, development and everyday work."
  },
  {
    id: 2,
    name: "Smartphone",
    price: 30000,
    category: "Electronics",
    description: "A modern smartphone with a high-quality display and powerful processor."
  },
  {
    id: 3,
    name: "Headphones",
    price: 2500,
    category: "Accessories",
    description: "Comfortable wireless headphones with clear sound."
  },
  {
    id: 4,
    name: "Keyboard",
    price: 1800,
    category: "Accessories",
    description: "A mechanical keyboard for comfortable and fast typing."
  },
  {
    id: 5,
    name: "Mouse",
    price: 1200,
    category: "Accessories",
    description: "An ergonomic mouse suitable for study and office work."
  },
  {
    id: 6,
    name: "Monitor",
    price: 15000,
    category: "Electronics",
    description: "A full HD monitor for development, study and entertainment."
  }
];

const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lab4-cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("lab4-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    setCart((oldCart) => {
      const found = oldCart.find((item) => item.id === product.id);

      if (found) {
        return oldCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...oldCart, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((oldCart) => oldCart.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  return useContext(CartContext);
}

function Navbar() {
  const { count } = useCart();

  return (
    <nav>
      <div className="logo">ReactStore</div>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart ({count})</Link>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="page">
      <div className="hero">
        <h1>Welcome to ReactStore</h1>
        <p>
          A multi-page Single Page Application built using React Router
          and Context API.
        </p>
        <Link className="button" to="/products">
          View Products
        </Link>
      </div>
    </div>
  );
}

function Products() {
  const { addToCart } = useCart();

  return (
    <div className="page">
      <h1>Products</h1>

      <div className="grid">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <h2>{product.name}</h2>
            <p className="category">{product.category}</p>
            <h3>₹{product.price.toLocaleString()}</h3>

            <Link
              className="button secondary"
              to={`/products/${product.id}`}
            >
              Details
            </Link>

            <button
              className="button"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return <NotFound />;
  }

  return (
    <div className="page">
      <div className="details">
        <h1>{product.name}</h1>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Price:</strong> ₹{product.price.toLocaleString()}</p>
        <p>{product.description}</p>

        <button className="button" onClick={() => addToCart(product)}>
          Add to Cart
        </button>

        <Link className="button secondary" to="/products">
          Back to Products
        </Link>
      </div>
    </div>
  );
}

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="page">
      <h1>Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="card">
          <h2>Your cart is empty.</h2>
          <Link className="button" to="/products">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <h3>{item.name}</h3>
                <p>
                  ₹{item.price.toLocaleString()} × {item.quantity}
                </p>
              </div>

              <button
                className="button danger"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="total">
            <h2>Total: ₹{total.toLocaleString()}</h2>
            <button className="button danger" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  return <Home />;
}

function NotFound() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The requested page does not exist.</p>
      <Link className="button" to="/">
        Go Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <>
      <style>{styles}</style>

      <BrowserRouter>
        <CartProvider>
          <Navbar />

          <Routes>
            <Route path="/" element={<LoadingPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
