import { useEffect, useState } from 'react';
import { fetchProducts } from './api';
import { useCart } from './CartContext';
import Cart from './Cart';

export default function App() {
  const { dispatch } = useCart();

  const [input, setInput] = useState('');         // what the user types
  const [query, setQuery] = useState('');         // debounced value
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounce: update query 300 ms after the user stops typing; reset page to 1
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(input);
      setPage(1);
    }, 300);
    return () => clearTimeout(t); // cleanup cancels the previous timer
  }, [input]);

  // Fetch with stale-response protection
  useEffect(() => {
    const controller = new AbortController();
    let active = true; // request-id style check: only the latest effect may write state

    setLoading(true);
    setError('');
    fetchProducts(query, page, { signal: controller.signal })
      .then((res) => {
        if (!active) return;
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        if (!active || err.name === 'AbortError') return;
        setError('Something went wrong');
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort(); // cancel the outdated request
    };
  }, [query, page]);

  return (
    <div className="layout">
      <main>
        <h1>Product Search</h1>
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search products..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {loading && <p className="status">Loading...</p>}
        {error && <p className="status error">{error}</p>}
        {!loading && !error && products.length === 0 && <p className="status">No results</p>}

        <ul className="products">
          {!loading &&
            products.map((p) => (
              <li key={p.id} data-testid="product-item" className="product">
                <strong>{p.name}</strong>
                <span>${p.price.toFixed(2)}</span>
                <button data-testid="add-btn" onClick={() => dispatch({ type: 'ADD', product: p })}>
                  Add to cart
                </button>
              </li>
            ))}
        </ul>

        <div className="pager">
          <button data-testid="prev-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button data-testid="next-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </main>
      <Cart />
    </div>
  );
}
