import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1999,
    icon: "🎧",
    desc: "Premium wireless headphones with clear sound and comfortable design."
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 2499,
    icon: "⌚",
    desc: "Smart watch with fitness tracking, notifications and modern design."
  },
  {
    id: 3,
    name: "Gaming Mouse",
    price: 1299,
    icon: "🖱️",
    desc: "Fast and accurate gaming mouse designed for smooth gameplay."
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 2999,
    icon: "⌨️",
    desc: "Mechanical keyboard with responsive keys for gaming and work."
  }
];

function Navbar({ cart }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">🛍️ ShopZone</Link>

      <div className="navLinks">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <span className="cart">🛒 Cart ({cart})</span>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="home">
      <div className="heroText">
        <div className="welcome">WELCOME TO SHOPZONE</div>

        <h1>
          Discover Amazing
          <br />
          <span>Products ✨</span>
        </h1>

        <p>
          Explore our collection of modern and useful products
          <br />
          at affordable prices.
        </p>

        <Link to="/products" className="mainButton">
          Explore Products →
        </Link>
      </div>

      <div className="heroVisual">
        <div className="circle"></div>
        <div className="shoppingBag">
          🛍️
        </div>
      </div>
    </div>
  );
}

function Products({ addToCart }) {
  return (
    <div className="productsPage">
      <div className="pageHeading">
        <div>OUR COLLECTION</div>
        <h1>Our Products</h1>
        <p>Choose your favourite product and add it to your cart.</p>
      </div>

      <div className="productGrid">
        {products.map((product) => (
          <div className="productCard" key={product.id}>
            <div className="productIcon">{product.icon}</div>

            <h2>{product.name}</h2>

            <p>{product.desc}</p>

            <div className="price">₹{product.price}</div>

            <div className="buttons">
              <Link
                to={`/products/${product.id}`}
                className="detailsBtn"
              >
                View Details
              </Link>

              <button
                className="cartBtn"
                onClick={() => addToCart()}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetails({ addToCart }) {
  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return <NotFound />;
  }

  return (
    <div className="detailsPage">
      <div className="detailsImage">
        <div className="bigIcon">{product.icon}</div>
      </div>

      <div className="detailsInfo">
        <div className="welcome">PRODUCT DETAILS</div>

        <h1>{product.name}</h1>

        <p>{product.desc}</p>

        <div className="detailPrice">
          ₹{product.price}
        </div>

        <button
          className="mainButton"
          onClick={() => addToCart()}
        >
          🛒 Add to Cart
        </button>

        <br />

        <Link to="/products" className="backLink">
          ← Back to Products
        </Link>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="notFound">
      <div className="errorNumber">404</div>

      <div className="errorEmoji">🔍</div>

      <h1>Page Not Found</h1>

      <p>
        Oops! The page you are looking for does not exist.
      </p>

      <Link to="/" className="mainButton">
        ← Back to Home
      </Link>
    </div>
  );
}

function App() {
  const [cart, setCart] = useState(0);

  const addToCart = () => {
    setCart((previous) => previous + 1);
  };

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f7ff;
          color: #17233c;
        }

        a {
          text-decoration: none;
        }

        button {
          font-family: inherit;
        }

        /* NAVBAR */

        .navbar {
          height: 72px;
          width: 100%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8%;
          box-shadow: 0 3px 18px rgba(0,0,0,0.07);
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #315dcc;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .navLinks a {
          color: #39445c;
          font-weight: 600;
        }

        .navLinks a:hover {
          color: #315dcc;
        }

        .cart {
          background: #eef3ff;
          color: #315dcc;
          padding: 9px 15px;
          border-radius: 20px;
          font-weight: 700;
        }

        /* HOME */

        .home {
          min-height: calc(100vh - 72px);
          padding: 70px 10%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
          background: linear-gradient(
            135deg,
            #f8faff,
            #eaf0ff
          );
        }

        .heroText {
          max-width: 650px;
        }

        .welcome {
          color: #315dcc;
          font-weight: 800;
          letter-spacing: 2px;
          font-size: 14px;
          margin-bottom: 18px;
        }

        .heroText h1 {
          font-size: 58px;
          line-height: 1.08;
          margin: 0;
          color: #17233c;
        }

        .heroText h1 span {
          color: #315dcc;
        }

        .heroText p {
          color: #687386;
          font-size: 18px;
          line-height: 1.7;
          margin: 25px 0 30px;
        }

        .mainButton {
          display: inline-block;
          border: none;
          background: #315dcc;
          color: white;
          padding: 14px 25px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(49,93,204,0.25);
        }

        .mainButton:hover {
          background: #244ba8;
        }

        .heroVisual {
          width: 350px;
          height: 350px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .circle {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: #dce6ff;
          position: absolute;
        }

        .shoppingBag {
          width: 210px;
          height: 210px;
          border-radius: 30px;
          background: white;
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 105px;
          box-shadow: 0 20px 50px rgba(40,60,100,0.15);
        }

        /* PRODUCTS */

        .productsPage {
          min-height: calc(100vh - 72px);
          padding: 65px 8%;
          background: #f5f7fc;
        }

        .pageHeading {
          text-align: center;
          margin-bottom: 45px;
        }

        .pageHeading > div {
          color: #315dcc;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        .pageHeading h1 {
          font-size: 42px;
          margin: 0 0 12px;
        }

        .pageHeading p {
          color: #687386;
          font-size: 17px;
        }

        .productGrid {
          max-width: 1150px;
          margin: auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .productCard {
          background: white;
          padding: 20px;
          border-radius: 18px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(30,50,90,0.08);
          transition: 0.25s;
        }

        .productCard:hover {
          transform: translateY(-7px);
          box-shadow: 0 18px 40px rgba(30,50,90,0.14);
        }

        .productIcon {
          height: 130px;
          background: #eef3ff;
          border-radius: 14px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 70px;
        }

        .productCard h2 {
          font-size: 20px;
          margin: 18px 0 10px;
        }

        .productCard p {
          color: #727b8c;
          font-size: 14px;
          line-height: 1.5;
          min-height: 65px;
        }

        .price {
          color: #315dcc;
          font-size: 24px;
          font-weight: 800;
          margin: 18px 0;
        }

        .buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .detailsBtn,
        .cartBtn {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .detailsBtn {
          color: white;
          background: #17233c;
        }

        .cartBtn {
          border: none;
          color: white;
          background: #315dcc;
          cursor: pointer;
        }

        /* DETAILS */

        .detailsPage {
          min-height: calc(100vh - 72px);
          padding: 70px 12%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 70px;
          background: #f5f7fc;
        }

        .detailsImage {
          height: 430px;
          background: white;
          border-radius: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 15px 40px rgba(30,50,90,0.08);
        }

        .bigIcon {
          width: 260px;
          height: 260px;
          background: #eef3ff;
          border-radius: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 130px;
        }

        .detailsInfo h1 {
          font-size: 50px;
          line-height: 1.1;
          margin: 10px 0 20px;
        }

        .detailsInfo p:not(.welcome) {
          color: #687386;
          font-size: 18px;
          line-height: 1.7;
        }

        .detailPrice {
          color: #315dcc;
          font-size: 30px;
          font-weight: 800;
          margin: 25px 0;
        }

        .backLink {
          display: inline-block;
          margin-top: 25px;
          color: #315dcc;
          font-weight: 700;
        }

        /* 404 PAGE */

        .notFound {
          min-height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          background: linear-gradient(
            135deg,
            #f8faff,
            #eaf0ff
          );
        }

        .errorNumber {
          font-size: 110px;
          font-weight: 900;
          color: #315dcc;
          line-height: 1;
        }

        .errorEmoji {
          font-size: 55px;
          margin: 10px 0;
        }

        .notFound h1 {
          font-size: 40px;
          margin: 5px 0 10px;
        }

        .notFound p {
          color: #687386;
          font-size: 17px;
          margin-bottom: 28px;
        }

        /* RESPONSIVE */

        @media (max-width: 950px) {

          .productGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .home {
            padding: 50px 6%;
          }

          .heroText h1 {
            font-size: 45px;
          }

          .detailsPage {
            padding: 50px 7%;
          }
        }

        @media (max-width: 650px) {

          .navbar {
            padding: 0 5%;
          }

          .navLinks {
            gap: 12px;
          }

          .home {
            flex-direction: column;
            text-align: center;
          }

          .heroText h1 {
            font-size: 40px;
          }

          .productGrid {
            grid-template-columns: 1fr;
          }

          .detailsPage {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

      <BrowserRouter>

        <Navbar cart={cart} />

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={
              <Products addToCart={addToCart} />
            }
          />

          <Route
            path="/products/:id"
            element={
              <ProductDetails addToCart={addToCart} />
            }
          />

          {/* WRONG URL = 404 PAGE */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </BrowserRouter>
    </>
  );
}

export default App;