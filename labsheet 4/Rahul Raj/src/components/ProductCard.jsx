import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';

export default function ProductCard({ product }) {
  const { addToCart, isFavorite, toggleFavorite } = useStore();
  const favorited = isFavorite(product.id);

  return (
    <article className="product-card">
      <div className="card-media-wrapper">
        <img src={product.image} alt={product.name} loading="lazy" />
        <button
          className={`btn-fav-circle ${favorited ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#ffffff'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <span className="category-tag-chip">{product.category}</span>
      </div>

      <div className="card-info-body">
        <div className="card-rating-row">
          <span className="rating-stars">★ {product.rating}</span>
          <span className="reviews-num">({product.reviewsCount} reviews)</span>
        </div>

        <h3 className="product-title-heading">
          <Link to={`/products/${product.id}`} className="title-link">
            {product.name}
          </Link>
        </h3>
        <p className="product-tagline-text">{product.tagline}</p>

        <div className="card-footer-action">
          <div className="price-tag-wrap">
            <span className="currency-sign">$</span>
            <span className="price-amount">{product.price}</span>
          </div>

          <div className="actions-cluster">
            <Link to={`/products/${product.id}`} className="btn-view-details">
              Details
            </Link>
            <button
              onClick={() => addToCart(product)}
              className="btn-add-cart-quick"
              title="Add 1 item to cart"
            >
              + Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
