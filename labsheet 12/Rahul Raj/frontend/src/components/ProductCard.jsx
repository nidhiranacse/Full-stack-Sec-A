/**
 * Product Card Component
 * BTCS303T Full Stack | Coding Assessment - Problem 3
 * 
 * Test Hooks:
 * - data-testid="product-item"
 * - data-testid="add-btn"
 */

import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Minus, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const { cart, addToCart, incrementQty, decrementQty } = useCart();

  const cartItem = cart.find(item => item.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  return (
    <article className="product-card" data-testid="product-item">
      <div className="product-image-wrap">
        <span className="product-emoji" aria-hidden="true">{product.image}</span>
        <span className="category-pill">{product.category}</span>
        <div className="rating-pill">
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating}</span>
        </div>
      </div>

      <div className="product-body">
        <div className="product-header">
          <h3 className="product-title">{product.name}</h3>
          <span className="product-stock-tag">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </span>
        </div>

        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <div className="price-tag">
            <span className="currency">$</span>
            <span className="amount">{product.price.toFixed(2)}</span>
          </div>

          <div className="card-actions">
            {inCartQty > 0 ? (
              <div className="qty-controls-inline">
                <button
                  type="button"
                  className="qty-btn-sm dec-btn"
                  onClick={() => decrementQty(product.id)}
                  title="Decrement quantity"
                  aria-label="Decrement quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-display">{inCartQty}</span>
                <button
                  type="button"
                  className="qty-btn-sm inc-btn"
                  onClick={() => incrementQty(product.id)}
                  title="Increment quantity"
                  aria-label="Increment quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : null}

            <button
              type="button"
              className={`btn-add-cart ${inCartQty > 0 ? 'added' : ''}`}
              data-testid="add-btn"
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              <ShoppingBag size={16} />
              <span>{inCartQty > 0 ? 'Add More' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
