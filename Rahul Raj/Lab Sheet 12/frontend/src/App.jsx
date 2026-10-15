/**
 * Main Application Component
 * BTCS303T Full Stack | Coding Assessment - Problem 3
 * 
 * Required Test Hooks:
 * - data-testid="search-input"
 * - data-testid="product-item"
 * - data-testid="add-btn"
 * - data-testid="next-btn"
 * - data-testid="cart-total"
 */

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from './context/CartContext';
import { fetchProducts } from './api/mockProducts';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import {
  Search,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageOpen,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import './App.css';

export default function App() {
  const { cart, cartTotal, totalItemCount } = useCart();

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);

  // Data fetching states
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Active fetch AbortController reference
  const abortControllerRef = useRef(null);

  // --------------------------------------------------------------------------
  // Requirement 1: Debounced Search (300ms) & Page Reset to 1 on Query Change
  // --------------------------------------------------------------------------
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Requirement: "The page resets to 1 whenever the query changes."
    setPage(1);
  };

  useEffect(() => {
    // 300 ms debounce timer
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // --------------------------------------------------------------------------
  // Requirement 2: Fetching with AbortController to Prevent Stale Responses
  // "if the user types 'ab' and then 'abc', the slower response for 'ab'
  //  must never overwrite the results for 'abc'."
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchProducts(debouncedQuery, page, { signal: controller.signal })
      .then(response => {
        // If aborted, do not update state
        if (!controller.signal.aborted) {
          setProducts(response.products);
          setTotalPages(response.totalPages);
          setTotalItems(response.total);
          setIsLoading(false);
        }
      })
      .catch(err => {
        // Ignore expected AbortError
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Fetch error:', err);
        setError('Failed to fetch products. Please try again.');
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, page]);

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-logo">
            <div className="brand-icon">
              <Sparkles size={22} color="#6366f1" />
            </div>
            <div>
              <h1 className="brand-name">NexStore</h1>
              <span className="brand-subtitle">BTCS303T Coding Assessment</span>
            </div>
          </div>

          {/* Search Box with data-testid="search-input" */}
          <div className="search-bar-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              data-testid="search-input"
              placeholder="Search products by title, category, or spec..."
              value={searchTerm}
              onChange={handleSearchChange}
              autoComplete="off"
              spellCheck="false"
            />
            {isLoading && (
              <Loader2 size={18} className="search-loader animate-spin" />
            )}
          </div>

          {/* Cart Header Badge & Persistent Cart Total */}
          <div className="header-cart-section">
            <div className="cart-total-badge" title="Current Cart Total">
              <span className="total-label">Total:</span>
              <span className="total-value" data-testid="cart-total">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              className="btn-cart-toggle"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
            >
              <ShoppingBag size={20} />
              <span className="cart-count-pill">{totalItemCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Banner with Query Info */}
        <section className="catalog-toolbar">
          <div className="toolbar-info">
            <h2>Product Catalog</h2>
            <p className="toolbar-subtitle">
              {debouncedQuery ? (
                <>Showing results for "<strong>{debouncedQuery}</strong>" &bull; {totalItems} items found</>
              ) : (
                <>Explore curated devices & accessories &bull; {totalItems} items total</>
              )}
            </p>
          </div>

          {/* Status Badges */}
          <div className="toolbar-tags">
            <span className="tag-badge">
              <ShieldCheck size={14} /> Debounced (300ms)
            </span>
            <span className="tag-badge">
              <RefreshCw size={14} /> AbortController Active
            </span>
          </div>
        </section>

        {/* Dynamic State Views */}
        {isLoading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin loader-icon" />
            <h3>Fetching products...</h3>
            <p>Simulating asynchronous latency (100ms &ndash; 800ms)</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-results-state">
            <PackageOpen size={48} className="no-results-icon" />
            <h3>No results</h3>
            <p>No products matched your search term "{debouncedQuery}". Try a different keyword.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {products.length > 0 && (
          <nav className="pagination-bar" aria-label="Catalog Pagination">
            <button
              type="button"
              className="pagination-btn prev-btn"
              data-testid="prev-btn"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1}
              aria-label="Previous Page"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <span className="page-indicator">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              className="pagination-btn next-btn"
              data-testid="next-btn"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              aria-label="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </main>

      {/* Cart Drawer Slide-out */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
