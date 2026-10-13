import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext.jsx';
import { useDebounce } from './hooks/useDebounce.js';
import { fetchProducts } from './api/fetchProducts.js';
import Cart from './components/Cart.jsx';

function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 350);
  const { addItem } = useCart();

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetchProducts(debouncedSearch).then((results) => {
      if (!isCancelled) {
        setProducts(results);
        setLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch]);

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b' }}>
          Debounced Product Search &amp; Reducer Cart
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Lab Sheet 12 Problem 3 &bull; React State Performance
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>
            Pulkit Goyal (CU24250263)
          </span>
          <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>
            Roll 40 &bull; Sec A
          </span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '28px' }}>
        {/* Search & Product List */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Search Catalog (Debounced 350ms):
            </label>
            <input
              type="text"
              placeholder="Type product name (e.g., keyboard, headphones)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              {loading ? 'Fetching debounced results...' : `Showing ${products.length} products`}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{p.category} &bull; {p.stock} in stock</div>
                  <div style={{ fontWeight: 700, color: '#2563eb', marginTop: '4px' }}>₹{p.price.toLocaleString()}</div>
                </div>
                <button
                  onClick={() => addItem(p)}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart Drawer */}
        <div>
          <Cart />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Catalog />
    </CartProvider>
  );
}
