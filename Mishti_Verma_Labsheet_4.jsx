import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams
} from "react-router-dom";

/* =========================
   PRODUCT DATA
========================= */

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 59.99,
    rating: 4.5,
    image: "🎧",
    color: "blue",
    description:
      "Experience premium sound quality with comfortable ear cushions and all-day comfort.",
    brand: "SoundPro",
    model: "SP-200",
    battery: "Up to 30 hours",
    warranty: "1 Year"
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 89.99,
    rating: 4.2,
    image: "⌚",
    color: "purple",
    description:
      "Track your fitness, notifications, and daily activities with this stylish smart watch.",
    brand: "TimeTech",
    model: "TT-500",
    battery: "Up to 7 days",
    warranty: "1 Year"
  },
  {
    id: 3,
    name: "Classic T-Shirt",
    category: "Fashion",
    price: 19.99,
    rating: 4.1,
    image: "👕",
    color: "green",
    description:
      "A comfortable and stylish classic T-shirt suitable for everyday wear.",
    brand: "StyleWear",
    model: "CW-101",
    battery: "N/A",
    warranty: "30 Days"
  },
  {
    id: 4,
    name: "Backpack",
    category: "Accessories",
    price: 49.99,
    rating: 4.3,
    image: "🎒",
    color: "orange",
    description:
      "A spacious backpack with multiple compartments for work, travel, and everyday use.",
    brand: "CarryMax",
    model: "CM-700",
    battery: "N/A",
    warranty: "6 Months"
  },
  {
    id: 5,
    name: "Running Shoes",
    category: "Fashion",
    price: 74.99,
    rating: 4.6,
    image: "👟",
    color: "blue",
    description:
      "Lightweight running shoes designed for comfort and performance.",
    brand: "RunFast",
    model: "RF-300",
    battery: "N/A",
    warranty: "6 Months"
  },
  {
    id: 6,
    name: "Sunglasses",
    category: "Accessories",
    price: 24.99,
    rating: 4.0,
    image: "🕶️",
    color: "purple",
    description:
      "Modern sunglasses offering comfort, style, and UV protection.",
    brand: "VisionX",
    model: "VX-100",
    battery: "N/A",
    warranty: "30 Days"
  },
  {
    id: 7,
    name: "Coffee Mug",
    category: "Home & Living",
    price: 12.99,
    rating: 4.3,
    image: "☕",
    color: "orange",
    description:
      "A stylish ceramic coffee mug perfect for your favorite hot drinks.",
    brand: "HomeStyle",
    model: "HS-220",
    battery: "N/A",
    warranty: "30 Days"
  },
  {
    id: 8,
    name: "Desk Lamp",
    category: "Home & Living",
    price: 36.99,
    rating: 4.2,
    image: "💡",
    color: "green",
    description:
      "An adjustable desk lamp with a clean modern design.",
    brand: "BrightLite",
    model: "BL-900",
    battery: "N/A",
    warranty: "1 Year"
  }
];

/* =========================
   CART CONTEXT
========================= */

const CartContext = createContext();

function useCart() {
  return useContext(CartContext);
}

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previousCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          quantity: 1
        }
      ];
    });
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================
   NAVBAR
========================= */

function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">🛍️</span>
        <span>ShopSphere</span>
      </Link>

      <div className="nav-links">
        <NavLink to="/">
          Home
        </NavLink>

        <NavLink to="/products">
          Products
        </NavLink>
      </div>

      <div className="cart-area">
        <span className="cart-icon">🛒</span>
        <span>Cart</span>

        <span className="cart-count">
          {cartCount}
        </span>
      </div>
    </nav>
  );
}

/* =========================
   HOME PAGE
========================= */

function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Welcome to <span>ShopSphere</span>
          </h1>

          <p>
            Discover amazing products at great prices.
            <br />
            Quality, style and value all in one place.
          </p>

          <Link to="/products" className="primary-btn">
            Shop Now <span>→</span>
          </Link>
        </div>

        <div className="hero-art">
          <div className="art-circle"></div>
          <div className="cart-illustration">🛒</div>
          <div className="shopping-bag">🛍️</div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon blue">♢</div>

          <div>
            <h3>Secure Shopping</h3>
            <p>
              Your data is protected with top-notch security.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon green">🚚</div>

          <div>
            <h3>Fast Delivery</h3>
            <p>
              Get your orders delivered quickly to your doorstep.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon purple">⟳</div>

          <div>
            <h3>Easy Returns</h3>
            <p>
              Not satisfied? Return within 30 days.
            </p>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <h2>Popular Categories</h2>

          <Link to="/products">
            View all products →
          </Link>
        </div>

        <div className="categories">
          <Link
            to="/products?category=Electronics"
            className="category-card"
          >
            <span>📱</span>
            Electronics
          </Link>

          <Link
            to="/products?category=Fashion"
            className="category-card"
          >
            <span>👕</span>
            Fashion
          </Link>

          <Link
            to="/products?category=Home%20%26%20Living"
            className="category-card"
          >
            <span>🛋️</span>
            Home & Living
          </Link>

          <Link
            to="/products?category=Accessories"
            className="category-card"
          >
            <span>👜</span>
            Accessories
          </Link>
        </div>
      </section>
    </div>
  );
}

/* =========================
   LOADING COMPONENT
========================= */

function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>

      <h2>Loading products...</h2>

      <p>
        Please wait a moment.
      </p>
    </div>
  );
}

/* =========================
   PRODUCT CARD
========================= */

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link
        to={`/products/${product.id}`}
        className="product-image"
      >
        <div
          className={`product-emoji ${product.color}`}
        >
          {product.image}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>

        <div className="product-bottom">
          <strong>
            ${product.price.toFixed(2)}
          </strong>

          <span className="rating">
            ★ {product.rating}
          </span>
        </div>

        <button
          className="small-cart-btn"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/* =========================
   PRODUCTS PAGE
========================= */

function Products() {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Home & Living",
    "Accessories"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category === selectedCategory
        );

  if (loading) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="products-layout">
      <aside className="filters">
        <h3>Filters</h3>

        <hr />

        <h4>Category</h4>

        {categories.map((category) => (
          <label
            className="filter-option"
            key={category}
          >
            <input
              type="radio"
              name="category"
              checked={
                selectedCategory === category
              }
              onChange={() =>
                setSelectedCategory(category)
              }
            />

            {category}
          </label>
        ))}

        <hr />

        <h4>Price Range</h4>

        <label className="filter-option">
          <input type="checkbox" />
          $0 - $50
        </label>

        <label className="filter-option">
          <input type="checkbox" />
          $50 - $100
        </label>

        <label className="filter-option">
          <input type="checkbox" />
          $100 - $200
        </label>

        <label className="filter-option">
          <input type="checkbox" />
          $200+
        </label>

        <button
          className="clear-btn"
          onClick={() =>
            setSelectedCategory("All")
          }
        >
          Clear Filters
        </button>
      </aside>

      <main className="products-main">
        <div className="products-header">
          <h1>All Products</h1>

          <select>
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
          </select>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

/* =========================
   PRODUCT DETAILS PAGE
========================= */

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);

  if (!product) {
    return <NotFound />;
  }

  const addMultipleToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <div className="details-page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>›</span>

        <Link to="/products">
          Products
        </Link>

        <span>›</span>

        <span>{product.name}</span>
      </div>

      <div className="details-card">
        <div className="product-gallery">
          <div
            className={`large-product-image ${product.color}`}
          >
            {product.image}
          </div>

          <div className="thumbnails">
            <button>{product.image}</button>
            <button>{product.image}</button>
            <button>{product.image}</button>
            <button>{product.image}</button>
          </div>
        </div>

        <div className="details-info">
          <p className="category-text">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <div className="details-price">
            ${product.price.toFixed(2)}
          </div>

          <div className="details-rating">
            ★ {product.rating}
            <span>(120 reviews)</span>
          </div>

          <p className="description">
            {product.description}
          </p>

          <div className="detail-list">
            <p>⚙ Brand: {product.brand}</p>
            <p>🔖 Model: {product.model}</p>
            <p>🔋 {product.battery}</p>
            <p>🛡 Warranty: {product.warranty}</p>
          </div>

          <div className="quantity-row">
            <span>Quantity:</span>

            <div className="quantity-control">
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.max(1, q - 1)
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity((q) => q + 1)
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="primary-btn"
              onClick={addMultipleToCart}
            >
              🛒 Add to Cart
            </button>

            <button
              className={`favorite-btn ${
                favorite ? "active-favorite" : ""
              }`}
              onClick={() =>
                setFavorite(!favorite)
              }
            >
              {favorite ? "♥ Favorited" : "♡ Add to Favorites"}
            </button>
          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/products")}
          >
            ← Back to Products
          </button>
        </div>
      </div>

      <section className="product-information">
        <h2>Product Information</h2>

        <p>
          This {product.name} is designed to provide
          excellent quality, comfort, and value. It is
          a great choice for everyday use.
        </p>

        <div className="info-grid">
          <div>
            <strong>Brand:</strong> {product.brand}
          </div>

          <div>
            <strong>Model:</strong> {product.model}
          </div>

          <div>
            <strong>Warranty:</strong> {product.warranty}
          </div>

          <div>
            <strong>Return Policy:</strong> 30 Days
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================
   404 PAGE
========================= */

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-icon">
        🔍
      </div>

      <h1>Oops! Page not found</h1>

      <p>
        The page you're looking for doesn't exist.
      </p>

      <Link to="/" className="primary-btn">
        Go Back Home
      </Link>
    </div>
  );
}

/* =========================
   APP CONTENT
========================= */

function AppContent() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          background: #f5f7fc;
          color: #17233c;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        /* NAVBAR */

        .navbar {
          height: 72px;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #101c3b;
          color: white;
          box-shadow:
            0 2px 15px
            rgba(10, 20, 50, 0.12);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 23px;
          font-weight: bold;
        }

        .brand-icon {
          font-size: 25px;
        }

        .nav-links {
          display: flex;
          gap: 38px;
          height: 100%;
          align-items: center;
        }

        .nav-links a {
          height: 100%;
          display: flex;
          align-items: center;
          opacity: 0.75;
          border-bottom:
            3px solid transparent;
        }

        .nav-links a.active {
          opacity: 1;
          border-bottom-color: #4f8cff;
        }

        .cart-area {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .cart-count {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #2866c5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        /* COMMON */

        .page,
        .details-page {
          max-width: 1180px;
          margin: auto;
          padding: 45px 25px;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 0;
          color: white;
          background:
            linear-gradient(
              120deg,
              #1769ff,
              #6945d8
            );
          padding: 14px 24px;
          border-radius: 9px;
          font-weight: bold;
          box-shadow:
            0 7px 18px
            rgba(23, 105, 255, 0.18);
        }

        /* HOME */

        .hero {
          min-height: 330px;
          border-radius: 20px;
          padding: 55px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #ffffff,
              #eef3ff
            );
          box-shadow:
            0 8px 30px
            rgba(30, 45, 80, 0.08);
        }

        .hero h1 {
          font-size: 42px;
          margin: 0 0 15px;
        }

        .hero h1 span {
          color: #2866c5;
        }

        .hero p {
          color: #60708b;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .hero-art {
          position: relative;
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .art-circle {
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: #e6edff;
        }

        .cart-illustration {
          position: relative;
          font-size: 125px;
          z-index: 2;
        }

        .shopping-bag {
          position: absolute;
          font-size: 65px;
          top: 42px;
          left: 55%;
          z-index: 3;
        }

        .features {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 18px;
          margin: 28px 0;
        }

        .feature-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: center;
          box-shadow:
            0 5px 20px
            rgba(30, 45, 80, 0.07);
        }

        .feature-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .feature-icon.blue {
          background: #edf3ff;
          color: #1769ff;
        }

        .feature-icon.green {
          background: #eaf9f0;
        }

        .feature-icon.purple {
          background: #f0edff;
          color: #7144e8;
        }

        .feature-card h3 {
          margin: 0 0 7px;
          font-size: 16px;
        }

        .feature-card p {
          margin: 0;
          color: #718099;
          font-size: 13px;
          line-height: 1.5;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 35px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 22px;
        }

        .section-heading a {
          color: #2866c5;
          font-size: 14px;
        }

        .categories {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 15px;
          margin-top: 18px;
        }

        .category-card {
          background: white;
          padding: 25px 15px;
          border-radius: 14px;
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          box-shadow:
            0 5px 18px
            rgba(30, 45, 80, 0.06);
          transition: 0.2s;
        }

        .category-card:hover {
          transform: translateY(-3px);
          color: #1769ff;
        }

        .category-card span {
          font-size: 28px;
        }

        /* LOADING */

        .loading-container {
          min-height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          border: 5px solid #e2e8f5;
          border-top-color: #2866c5;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-container h2 {
          margin: 22px 0 5px;
        }

        .loading-container p {
          color: #718099;
        }

        /* PRODUCTS */

        .products-layout {
          max-width: 1300px;
          margin: auto;
          padding: 35px 25px;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 25px;
        }

        .filters {
          background: white;
          border-radius: 16px;
          padding: 22px;
          height: fit-content;
          box-shadow:
            0 5px 22px
            rgba(30, 45, 80, 0.07);
        }

        .filters h3 {
          margin-top: 0;
        }

        .filters h4 {
          margin-bottom: 13px;
        }

        .filters hr {
          border: 0;
          border-top: 1px solid #e6eaf1;
          margin: 18px 0;
        }

        .filter-option {
          display: block;
          margin: 12px 0;
          color: #596983;
          font-size: 14px;
        }

        .filter-option input {
          margin-right: 8px;
          accent-color: #2866c5;
        }

        .clear-btn {
          width: 100%;
          margin-top: 15px;
          padding: 11px;
          background: white;
          border: 1px solid #dbe2ee;
          border-radius: 8px;
          color: #42516a;
        }

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .products-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .products-header select {
          border: 1px solid #dbe2ee;
          padding: 10px;
          border-radius: 8px;
          background: white;
          color: #42516a;
        }

        .products-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 16px;
        }

        .product-card {
          background: white;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 5px 20px
            rgba(30, 45, 80, 0.07);
          transition: 0.2s;
        }

        .product-card:hover {
          transform: translateY(-4px);
        }

        .product-image {
          height: 170px;
          background: #f1f4fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-emoji {
          width: 115px;
          height: 115px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 65px;
        }

        .product-emoji.blue {
          background: #eaf1ff;
        }

        .product-emoji.purple {
          background: #f1edff;
        }

        .product-emoji.green {
          background: #eaf9f0;
        }

        .product-emoji.orange {
          background: #fff2df;
        }

        .product-info {
          padding: 15px;
        }

        .product-info h3 {
          margin: 0 0 15px;
          font-size: 14px;
          min-height: 34px;
        }

        .product-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-bottom strong {
          color: #1558d6;
        }

        .rating {
          color: #c68100;
          font-size: 13px;
        }

        .small-cart-btn {
          width: 100%;
          margin-top: 14px;
          padding: 9px;
          border: 1px solid #2866c5;
          color: #2866c5;
          background: white;
          border-radius: 7px;
        }

        .small-cart-btn:hover {
          background: #2866c5;
          color: white;
        }

        /* PRODUCT DETAILS */

        .breadcrumbs {
          display: flex;
          gap: 10px;
          color: #718099;
          font-size: 14px;
          margin-bottom: 22px;
        }

        .breadcrumbs a {
          color: #2866c5;
        }

        .details-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow:
            0 5px 25px
            rgba(30, 45, 80, 0.07);
        }

        .large-product-image {
          height: 390px;
          border-radius: 16px;
          background: #f0f3f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 180px;
        }

        .large-product-image.blue {
          background: #edf3ff;
        }

        .large-product-image.purple {
          background: #f3efff;
        }

        .large-product-image.green {
          background: #effbf4;
        }

        .large-product-image.orange {
          background: #fff5e8;
        }

        .thumbnails {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 10px;
          margin-top: 12px;
        }

        .thumbnails button {
          height: 70px;
          border: 1px solid #e2e7f0;
          background: #f8f9fc;
          border-radius: 9px;
          font-size: 30px;
        }

        .category-text {
          color: #2866c5;
          font-size: 14px;
          margin-bottom: 7px;
        }

        .details-info h1 {
          margin: 0;
          font-size: 34px;
        }

        .details-price {
          font-size: 28px;
          font-weight: bold;
          color: #1769ff;
          margin: 15px 0 8px;
        }

        .details-rating {
          color: #d58900;
          font-size: 15px;
        }

        .details-rating span {
          color: #718099;
          margin-left: 8px;
        }

        .description {
          line-height: 1.7;
          color: #596983;
          margin-top: 25px;
        }

        .detail-list {
          margin: 22px 0;
          color: #596983;
          font-size: 14px;
          line-height: 1.4;
        }

        .quantity-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 22px 0;
        }

        .quantity-control {
          display: flex;
          border: 1px solid #dbe2ee;
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-control button,
        .quantity-control span {
          width: 38px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: white;
        }

        .quantity-control span {
          border-left: 1px solid #dbe2ee;
          border-right: 1px solid #dbe2ee;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .favorite-btn {
          padding: 14px 18px;
          border-radius: 9px;
          border: 1px solid #d7dfeb;
          background: white;
          color: #42516a;
        }

        .active-favorite {
          color: #d52e55;
          border-color: #d52e55;
        }

        .back-btn {
          margin-top: 20px;
          border: 0;
          background: transparent;
          color: #2866c5;
        }

        .product-information {
          background: white;
          margin-top: 25px;
          padding: 30px;
          border-radius: 20px;
          box-shadow:
            0 5px 25px
            rgba(30, 45, 80, 0.07);
        }

        .product-information h2 {
          margin-top: 0;
        }

        .product-information p {
          color: #596983;
          line-height: 1.7;
        }

        .info-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 15px;
          color: #596983;
          margin-top: 22px;
        }

        /* 404 */

        .not-found {
          min-height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .not-found-icon {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #edf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 55px;
        }

        .not-found h1 {
          margin: 25px 0 10px;
          font-size: 34px;
        }

        .not-found p {
          color: #718099;
          margin-bottom: 25px;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {
          .products-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .hero h1 {
            font-size: 34px;
          }
        }

        @media (max-width: 800px) {
          .navbar {
            padding: 0 25px;
          }

          .nav-links {
            gap: 18px;
          }

          .hero,
          .details-card {
            grid-template-columns: 1fr;
          }

          .hero {
            padding: 35px;
          }

          .hero-art {
            display: none;
          }

          .features {
            grid-template-columns: 1fr;
          }

          .categories {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .products-layout {
            grid-template-columns: 1fr;
          }

          .filters {
            width: 100%;
          }

          .products-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 550px) {
          .navbar {
            height: 65px;
          }

          .brand {
            font-size: 18px;
          }

          .nav-links {
            display: none;
          }

          .page,
          .details-page {
            padding: 20px 15px;
          }

          .hero h1 {
            font-size: 29px;
          }

          .categories {
            grid-template-columns: 1fr;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .details-card {
            padding: 18px;
          }

          .large-product-image {
            height: 280px;
            font-size: 120px;
          }

          .action-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .products-layout {
            padding: 20px 15px;
          }
        }

      `}</style>
    </>
  );
}

/* =========================
   MAIN APP
========================= */

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}