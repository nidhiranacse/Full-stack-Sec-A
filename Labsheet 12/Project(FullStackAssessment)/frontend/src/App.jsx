
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";

import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import CartPanel from "./components/CartPanel";
import { fetchProducts } from "./services/products";

export default function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const requestId = useRef(0);

  // Wait 300 ms after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch products and ignore results from older requests.
  useEffect(() => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError(false);

    fetchProducts(debouncedQuery, page)
      .then((result) => {
        if (currentRequest !== requestId.current) return;

        setProducts(result.products);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch(() => {
        if (currentRequest !== requestId.current) return;

        setProducts([]);
        setTotal(0);
        setTotalPages(0);
        setError(true);
      })
      .finally(() => {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      });

    return () => {
      // Invalidate this request when search or page changes.
      if (requestId.current === currentRequest) {
        requestId.current++;
      }
    };
  }, [debouncedQuery, page]);

  function handleSearch(event) {
    setQuery(event.target.value);
    setPage(1);
  }

  function changePage(nextPage) {
    setPage(nextPage);
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  return (
    <div id="home" className="app-shell">
      <Header />

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-tag">
              <Sparkles size={14} />
              YOUR EVERYDAY, UPGRADED
            </div>

            <h1>
              Good things.
              <br />
              <span>Better living.</span>
            </h1>

            <p className="hero-description">
              Thoughtfully picked essentials for your everyday life.
              Find your next favourite thing.
            </p>

            <a className="hero-link" href="#products">
              Discover the collection <ArrowDown size={17} />
            </a>
          </div>

          <div className="hero-art" aria-label="Shopping collection">
            <div className="hero-circle circle-back"></div>
            <div className="hero-circle circle-front"></div>
            <div className="hero-note">
              <span className="note-star">✳</span>
              <span>Small finds.<br />Big joy.</span>
            </div>
            <div className="hero-sticker">MADE FOR<br />YOUR EVERYDAY</div>
            <div className="hero-number">01 / 04</div>
          </div>
        </section>

        <section className="collection-section" id="products">
          <div className="section-topline">
            <div>
              <p className="eyebrow">THE GOOD STUFF</p>
              <h2>Find your favourites<span className="title-dot">.</span></h2>
            </div>

            <span className="result-count">
              {loading ? "Finding products..." : `${total} items to explore`}
            </span>
          </div>

          <div className="search-toolbar">
            <label className="search-box">
              <Search size={19} />
              <input
                type="search"
                data-testid="search-input"
                value={query}
                onChange={handleSearch}
                placeholder="Search products or categories..."
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <div className="filter-label">
              <SlidersHorizontal size={17} />
              <span>Curated collection</span>
            </div>
          </div>

          {loading ? (
            <div className="status-panel" role="status">
              <div className="loading-spinner"></div>
              <h3>Finding the good stuff...</h3>
              <p>Just a moment while we look through the collection.</p>
            </div>
          ) : error ? (
            <div className="status-panel">
              <h3>Something went wrong</h3>
              <p>We could not load the products. Please try searching again.</p>
              <button
                className="retry-btn"
                onClick={() => setDebouncedQuery((value) => value + " ")}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="status-panel">
              <div className="empty-search-icon">
                <Search size={25} />
              </div>
              <h3>No results this time</h3>
              <p>Try a different name or category to find what you need.</p>
              <button
                className="retry-btn"
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  setPage(1);
                }}
                type="button"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 0 && (
            <div className="pagination">
              <span className="page-description">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <div className="pagination-buttons">
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ArrowLeft size={17} />
                  Previous
                </button>

                <button
                  type="button"
                  className="page-btn next-page-btn"
                  data-testid="next-btn"
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  Next
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="bottom-banner">
          <div>
            <p className="eyebrow">A BETTER KIND OF EVERYDAY</p>
            <h2>Keep the things<br />that make you smile.</h2>
          </div>
          <a href="#products">Explore more ↗</a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon"><Sparkles size={18} /></span>
          <span>nexa<span className="brand-dot">.</span></span>
        </a>
        <span>Everyday essentials, thoughtfully selected.</span>
        <span>© 2026 Nexa Store</span>
      </footer>

      <CartPanel />
    </div>
  );
}

