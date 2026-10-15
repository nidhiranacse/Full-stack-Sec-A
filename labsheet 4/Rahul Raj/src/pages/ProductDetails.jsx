import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function ProductDetails() {
  const { id } = useParams(); // Extract route params (Syllabus Task 2)
  const { addToCart, isFavorite, toggleFavorite } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Loading State (Syllabus Task 4)
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setLoading(true);
    // Simulate asynchronous data retrieval with a brief timeout
    const timer = setTimeout(() => {
      const found = products.find((p) => p.id === id);
      setProduct(found || null);
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="page-details-root">
        <LoadingSkeleton message={`Loading product profile [${id}]...`} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-details-root">
        <div className="product-not-found-card">
          <span className="error-icon">⚠️</span>
          <h2>Product Not Found</h2>
          <p>The product with route ID <code>{id}</code> does not exist in our catalog database.</p>
          <Link to="/products" className="btn-back-to-products">
            &larr; Return to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setNotification(`Added ${quantity}x "${product.name}" to cart!`);
    setTimeout(() => setNotification(''), 3500);
  };

  return (
    <div className="page-details-root">
      {/* Navigation Breadcrumb */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="crumb-sep">/</span>
        <Link to="/products">Products</Link>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{product.name}</span>
      </nav>

      {/* Added to Cart Notification Banner */}
      {notification && (
        <div className="cart-added-notification">
          <span>✓ {notification}</span>
        </div>
      )}

      <div className="product-details-layout">
        {/* Left Column: Image Showcase */}
        <div className="product-gallery-panel">
          <div className="main-image-container">
            <img src={product.image} alt={product.name} />
            <button
              className={`btn-fav-large ${favorited ? 'active' : ''}`}
              onClick={() => toggleFavorite(product.id)}
              aria-label={favorited ? 'Remove favorite' : 'Add favorite'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#ffffff'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="product-summary-panel">
          <div className="category-and-stock-row">
            <span className="product-category-chip">{product.category}</span>
            {product.inStock ? (
              <span className="badge-stock in-stock">● In Stock &bull; Ships Today</span>
            ) : (
              <span className="badge-stock out-stock">○ Backorder &bull; 1 Week</span>
            )}
          </div>

          <h1 className="details-product-title">{product.name}</h1>
          <p className="details-tagline">{product.tagline}</p>

          <div className="details-rating-row">
            <span className="stars-badge">★ {product.rating}</span>
            <span className="reviews-text">Verified by {product.reviewsCount} engineering teams</span>
          </div>

          <div className="details-price-banner">
            <span className="price-label">Price:</span>
            <span className="price-big">${product.price}</span>
            <span className="vat-text">USD (Tax Included)</span>
          </div>

          <p className="details-long-description">{product.description}</p>

          {/* Quantity & Add to Cart Controls */}
          <div className="purchase-controls-box">
            <div className="qty-selector-group">
              <label htmlFor="qty-input">Quantity:</label>
              <div className="stepper-wrap">
                <button
                  type="button"
                  className="btn-step"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="step-val">{quantity}</span>
                <button
                  type="button"
                  className="btn-step"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-details-add-cart"
              disabled={!product.inStock}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {product.inStock ? `Add ${quantity} to Cart &bull; $${product.price * quantity}` : 'Currently Out of Stock'}
            </button>
          </div>

          {/* Route Params Inspection Pill */}
          <div className="route-params-inspector">
            <span className="inspector-lbl">Route Params Passed:</span>
            <code>useParams().id = "{id}"</code>
          </div>

          {/* Structured Definition List for Specifications */}
          <div className="specs-definition-section">
            <h3 className="specs-heading">Technical Specifications</h3>
            <dl className="specs-dl-list">
              {Object.entries(product.specs).map(([term, desc]) => (
                <div key={term} className="specs-dl-row">
                  <dt className="specs-dt">{term}</dt>
                  <dd className="specs-dd">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
