import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function Home() {
  const { totalCartItems, favorites } = useStore();
  const featured = products.slice(0, 3);

  return (
    <div className="page-home-root">
      {/* Hero Section */}
      <section className="home-hero-banner">
        <div className="hero-content-wrap">
          <div className="hero-pill-badge">
            <span className="dot-live"></span>
            <span>Lab 4 &bull; React Routing &amp; Context Global State</span>
          </div>
          <h1 className="hero-headline">
            Engineered Hardware for <span className="text-gradient">Modern Developers</span>.
          </h1>
          <p className="hero-subtext">
            A high-performance single-page application built with <strong>react-router-dom</strong> and React <strong>Context API</strong>. Experience seamless multi-page transitions, route params, persistent cart &amp; favorites state, and instantaneous updates.
          </p>

          <div className="hero-cta-buttons">
            <Link to="/products" className="btn-hero-primary">
              Explore Full Catalog &rarr;
            </Link>
            <div className="hero-live-state-chip">
              <span>Cart: <strong>{totalCartItems}</strong></span>
              <span>&bull;</span>
              <span>Favorites: <strong>{favorites.length}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="home-categories-section">
        <div className="section-title-header">
          <span className="sec-kicker">Curated Ecosystem</span>
          <h2 className="sec-heading">Engineered Categories</h2>
        </div>

        <div className="categories-grid">
          <Link to="/products?cat=Computing" className="category-tile-card">
            <span className="cat-icon">💻</span>
            <h3 className="cat-name">Computing &amp; Nodes</h3>
            <p className="cat-sub">UNIX Workstations &amp; Micro Clusters</p>
          </Link>
          <Link to="/products?cat=Audio" className="category-tile-card">
            <span className="cat-icon">🎧</span>
            <h3 className="cat-name">Acoustic Engineering</h3>
            <p className="cat-sub">Spatial Isolation ANC Headsets</p>
          </Link>
          <Link to="/products?cat=Peripherals" className="category-tile-card">
            <span className="cat-icon">⌨️</span>
            <h3 className="cat-name">Tactile Peripherals</h3>
            <p className="cat-sub">Gasket Mechanicals &amp; Ergonomics</p>
          </Link>
          <Link to="/products?cat=Displays" className="category-tile-card">
            <span className="cat-icon">🖥️</span>
            <h3 className="cat-name">Curved Displays</h3>
            <p className="cat-sub">38" Ultrawide High DCI-P3 Canvases</p>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="home-featured-section">
        <div className="section-title-header">
          <span className="sec-kicker">Top Rated Gear</span>
          <h2 className="sec-heading">Featured Developer Picks</h2>
          <p className="sec-desc">Directly pass data and manage global shopping cart states seamlessly across routes.</p>
        </div>

        <div className="products-cards-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="view-all-row">
          <Link to="/products" className="btn-view-all-products">
            Browse All {products.length} Products &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
