import { useEffect, useRef, useState } from "react";
import { fetchProducts } from "./api";
import { useCart } from "./CartContext";
import Cart from "./Cart";

export default function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);

  const { addToCart } = useCart();

  const pageSize = 4;
  const totalPages = Math.ceil(total / pageSize);

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch products
  useEffect(() => {
    let active = true;

    const currentRequest = ++requestId.current;

    setLoading(true);

    fetchProducts(debouncedQuery, page)
      .then((result) => {
        // Ignore stale responses
        if (
          active &&
          currentRequest === requestId.current
        ) {
          setProducts(result.data);
          setTotal(result.total);
        }
      })
      .finally(() => {
        if (
          active &&
          currentRequest === requestId.current
        ) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, page]);

  return (
    <div className="app">
      <header>
        <h1>Product Search</h1>
        <p>Search products and manage your cart</p>
      </header>

      <main>
        <section className="search-section">
          <input
            data-testid="search-input"
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </section>

        <section className="products-section">
          <h2>Products</h2>

          {loading && (
            <div className="message">
              Loading products...
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="message">
              No results found.
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="product-grid">
              {products.map((product) => (
                <div
                  className="product-card"
                  data-testid="product-item"
                  key={product.id}
                >
                  <h3>{product.name}</h3>

                  <p className="price">
                    ₹{product.price.toLocaleString()}
                  </p>

                  <button
                    data-testid="add-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pagination">
            <button
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={page === 1}
            >
              Previous
            </button>

            <span>
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <button
              data-testid="next-btn"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={
                page >= totalPages || totalPages === 0
              }
            >
              Next
            </button>
          </div>
        </section>

        <Cart />
      </main>
    </div>
  );
}