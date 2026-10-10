// ─── App Component ──────────────────────────────────────────────────
// Orchestrates search, product listing, pagination, and cart sidebar.
// Handles debounced search, AbortController for stale responses, and
// pagination that resets on query change.

import { useState, useEffect, useRef } from 'react';
import useDebounce from './hooks/useDebounce';
import fetchProducts from './api/fetchProducts';
import Cart from './components/Cart.jsx';
import { useCart } from './context/CartContext.jsx';

export default function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const abortRef = useRef(null);

  const { dispatch } = useCart();

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // Fetch products when debouncedQuery or page changes
  useEffect(() => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setSearched(true);

    fetchProducts(debouncedQuery, page, controller.signal)
      .then((result) => {
        setProducts(result.data);
        setTotalPages(result.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setLoading(false);
        }
        // AbortError is expected — we just ignore it
      });

    return () => controller.abort();
  }, [debouncedQuery, page]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <h1 className="app__title">Product Search</h1>
        <p className="app__subtitle">Find and add products to your cart</p>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Search */}
        <div className="search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            data-testid="search-input"
            className="search-bar__input"
            type="text"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="loading__spinner" />
            <span>Searching products…</span>
          </div>
        )}

        {/* Products */}
        {!loading && products.length > 0 && (
          <>
            <div className="product-list">
              {products.map((product) => (
                <div
                  key={product.id}
                  data-testid="product-item"
                  className="product-card"
                >
                  <span className="product-card__name">{product.name}</span>
                  <span className="product-card__price">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    data-testid="add-btn"
                    className="product-card__btn"
                    onClick={() => dispatch({ type: 'ADD', product })}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span className="pagination__info">
                Page {page} of {totalPages}
              </span>
              <button
                data-testid="next-btn"
                className="pagination__btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* No Results */}
        {!loading && searched && products.length === 0 && (
          <div className="no-results">
            <div className="no-results__icon">📭</div>
            <p>No results found for "{debouncedQuery}"</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <Cart />
    </div>
  );
}
