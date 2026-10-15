import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 404 Not Found Page
 * Fulfills syllabus requirement: Add a 404 Not Found page
 */
export default function NotFound() {
  const location = useLocation();

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <span className="not-found-digit">404</span>
        <h1 className="not-found-title">Page Route Not Found</h1>
        <p className="not-found-desc">
          The requested SPA path <code className="route-code">{location.pathname}</code> does not correspond to any registered route in <code>react-router-dom</code>.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-notfound-home">
            &larr; Return to Home Page
          </Link>
          <Link to="/products" className="btn-notfound-products">
            Browse Products Catalog
          </Link>
        </div>

        <div className="registered-routes-box">
          <span className="routes-title">Registered Active SPA Routes:</span>
          <ul>
            <li><code>/</code> &mdash; Home Landing Page</li>
            <li><code>/products</code> &mdash; Full Products Catalog</li>
            <li><code>/products/:id</code> &mdash; Dynamic Route Params Specification</li>
            <li><code>*</code> &mdash; Catch-all 404 Fallback Handler</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
