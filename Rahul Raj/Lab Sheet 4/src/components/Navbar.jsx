import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';

export default function Navbar() {
  const { totalCartItems, favorites, setIsCartOpen } = useStore();

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Left: Brand and Portal link */}
        <div className="nav-brand-section">
          <a href="../index.html" className="btn-portal-back" title="Return to All Labs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Portal
          </a>
          <NavLink to="/" className="brand-link">
            <span className="brand-logo-icon">⚡</span>
            <span className="brand-name">AuraTech<span className="brand-highlight">.io</span></span>
          </NavLink>
        </div>

        {/* Center: Routes Navigation */}
        <nav className="nav-links" aria-label="Main Store Navigation">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Products
          </NavLink>
        </nav>

        {/* Right: Global State Controls (Favorites & Cart) */}
        <div className="nav-actions">
          <div className="favorites-indicator" title="Bookmarked Favorites">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="badge-count fav-badge">{favorites.length}</span>
          </div>

          <button
            className="cart-toggle-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="cart-text">Cart</span>
            <span className="badge-count cart-badge">{totalCartItems}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
