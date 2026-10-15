import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="hero">

        <div className="hero-content">
          <h1>
            Welcome to <span>MyShop</span>
          </h1>

          <p className="hero-subtitle">
            Find the best products at great prices.
          </p>

          <p className="hero-description">
            Shop your favorites from a wide range of
            quality products, all in one place.
          </p>

          <Link to="/products" className="shop-button">
            Browse Products →
          </Link>
        </div>

        <div className="hero-visual">

          {/* Decorative background */}
          <div className="circle-bg"></div>

          {/* Shopping girl illustration */}
          <div className="girl-illustration">

            <div className="hair"></div>

            <div className="girl-head">
              <div className="eye left-eye"></div>
              <div className="eye right-eye"></div>
              <div className="smile"></div>
            </div>

            <div className="girl-body"></div>

            <div className="arm left-arm"></div>
            <div className="arm right-arm"></div>

            <div className="shopping-bag bag-left">
              🛍️
            </div>

            <div className="shopping-bag bag-right">
              🛍️
            </div>

            <div className="leg left-leg"></div>
            <div className="leg right-leg"></div>

          </div>

          {/* Floating cards */}
          <div className="info-card products-card">
            <div className="info-icon">🛍️</div>
            <div>
              <b>100+</b>
              <small>Products</small>
            </div>
          </div>

          <div className="info-card rating-card">
            <div className="info-icon">⭐</div>
            <div>
              <b>4.9/5</b>
              <small>Customer Rating</small>
            </div>
          </div>

        </div>

      </section>
    </div>
  );
}

export default Home;