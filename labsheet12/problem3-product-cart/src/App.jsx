import { useEffect, useRef, useState } from "react";

import { fetchProducts } from "./data/api";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const requestId = ++requestIdRef.current;

      setLoading(true);

      fetchProducts(query, page)
        .then((result) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setProducts(result.data);
          setTotal(result.total);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, page]);

  const totalPages = Math.ceil(total / 4);

  return (
    <main>
      <h1>Product Store</h1>

      <input
        data-testid="search-input"
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ProductList products={products} />
      )}

      <div>
        <button
          disabled={page === 1}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </button>

        <span>
          {" "}
          Page {page} of {Math.max(totalPages, 1)}{" "}
        </span>

        <button
          data-testid="next-btn"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>

      <Cart />
    </main>
  );
}

export default App;