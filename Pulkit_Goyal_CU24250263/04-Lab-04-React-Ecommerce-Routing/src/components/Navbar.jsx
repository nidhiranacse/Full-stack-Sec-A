import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

/**
 * Navbar Component with React Router NavLinks and Cart Counter
 */
export default function Navbar() {
  const { totalItemsCount } = useCart();

  return (
    <header className="nav-header">
      <div className="nav-container">
        <Link to="/" className="brand-link">
          <span>🛒 TechMart</span>
          <span className="student-badge-small">Pulkit Goyal (Roll 40)</span>
        </Link>

        <nav>
          <ul className="nav-menu">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                Catalog
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" className="cart-link-btn">
                <span>Cart</span>
                <span style={{ background: 'white', color: '#2563eb', padding: '1px 7px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {totalItemsCount}
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
