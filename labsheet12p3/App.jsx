import React, { useEffect, useRef, useState } from "react";
import { useCart } from "./CartContext";
import { fetchProducts } from "./fetchProducts";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const requestId = useRef(0);
  const { cart, dispatch, total } = useCart();

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentRequest = ++requestId.current;

      setLoading(true);

      fetchProducts(query, page)
        .then((result) => {
          if (currentRequest !== requestId.current) return;

          const data = Array.isArray(result)
            ? result
            : result.data || [];

          setProducts(data);
          setHasNext(data.length > 0);
        })
        .catch(() => {
          if (currentRequest === requestId.current) {
            setProducts([]);
            setHasNext(false);
          }
        })
        .finally(() => {
          if (currentRequest === requestId.current) {
            setLoading(false);
          }
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, page]);

  const handleNext = () => {
    if (hasNext) setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div>
          <h1>Product Store</h1>
          <p>Search and add your favourite products</p>
        </div>

        <div className="cart-badge">
          🛒 {Object.keys(cart).length} Items
        </div>
      </header>

      {/* Search */}
      <section className="search-section">
        <input
          data-testid="search-input"
          type="text"
          placeholder="🔍 Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      {/* Main */}
      <main>

        <div className="section-title">
          <h2>Products</h2>
          <span>Page {page}</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {/* No results */}
        {!loading && products.length === 0 && (
          <div className="no-results">
            <div>🔍</div>
            <h3>No results</h3>
            <p>Try searching for another product.</p>
          </div>
        )}

        {/* Products */}
        {!loading && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <div
                className="product-card"
                data-testid="product-item"
                key={product.id}
              >
                <div className="product-icon">
                  🛍️
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p className="price">
                    ₹{product.price}
                  </p>

                  <button
                    className="add-btn"
                    data-testid="add-btn"
                    onClick={() =>
                      dispatch({
                        type: "ADD",
                        product
                      })
                    }
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button
            className="page-btn"
            onClick={handlePrevious}
            disabled={page === 1}
          >
            ← Previous
          </button>

          <span className="page-number">
            {page}
          </span>

          <button
            className="page-btn"
            data-testid="next-btn"
            onClick={handleNext}
            disabled={!hasNext}
          >
            Next →
          </button>
        </div>

        {/* Cart */}
        <section className="cart-section">
          <div className="cart-header">
            <h2>🛒 Your Cart</h2>

            <span className="cart-total" data-testid="cart-total">
              ₹{total}
            </span>
          </div>

          {Object.values(cart).length === 0 ? (
            <p className="empty-cart">
              Your cart is empty.
            </p>
          ) : (
            <div className="cart-items">
              {Object.values(cart).map((item) => (
                <div className="cart-item" key={item.id}>

                  <div>
                    <h4>{item.name}</h4>
                    <p>₹{item.price} × {item.quantity}</p>
                  </div>

                  <div className="quantity">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "DEC",
                          id: item.id
                        })
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        dispatch({
                          type: "INC",
                          id: item.id
                        })
                      }
                    >
                      +
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;