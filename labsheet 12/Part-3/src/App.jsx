import { useState, useEffect, useRef } from "react";
import { CartProvider } from "./context/CartContext";
import { useDebounce } from "./hooks/useDebounce";
import { fetchProducts } from "./api/fetchProducts";
import SearchBar from "./components/SearchBar";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

function AppContent() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // AbortController ref to cancel stale requests
  const abortRef = useRef(null);

  // Reset page to 1 when the debounced query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // Fetch products whenever debouncedQuery or page changes
  useEffect(() => {
    // Abort the previous in-flight request (prevents stale data)
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchProducts(debouncedQuery, page, {
          signal: controller.signal,
        });
        if (!cancelled) {
          setProducts(result.products);
          setHasMore(result.hasMore);
        }
      } catch (err) {
        // Ignore abort errors — they're expected
        if (err.name !== "AbortError" && !cancelled) {
          console.error("Fetch failed:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery, page]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-icon">🛍️</span> ProductSearch
          </h1>
          <SearchBar query={query} onChange={setQuery} />
        </div>
      </header>

      <main className="app-main">
        <ProductList
          products={products}
          loading={loading}
          page={page}
          hasMore={hasMore}
          onPageChange={setPage}
        />
      </main>

      <Cart />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
