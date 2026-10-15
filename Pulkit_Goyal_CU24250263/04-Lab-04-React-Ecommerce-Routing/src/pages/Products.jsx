import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';

export default function Products() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');

  const categories = ['All', 'Peripherals', 'Audio', 'Displays', 'Books', 'Accessories'];

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) ||
                         p.description.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Product Catalog</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>Showing {filtered.length} products</p>
        </div>

        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minWidth: '220px' }}
        />
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid #e2e8f0',
              background: selectedCategory === c ? '#2563eb' : 'white',
              color: selectedCategory === c ? 'white' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
          <h3>No products match your criteria.</h3>
          <p>Try searching for a different term or resetting the category filter.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <div key={p.id} className="prod-card">
              <div className="prod-card-thumb">{p.image}</div>
              <div className="prod-card-body">
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>
                    {p.category}
                  </span>
                  <h3 style={{ margin: '6px 0 10px', fontSize: '1.15rem' }}>{p.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '14px' }}>
                    {p.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{p.price.toLocaleString()}</span>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{p.stock} in stock</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/products/${p.id}`} className="btn-outline" style={{ flex: 1 }}>
                      Details
                    </Link>
                    <button onClick={() => addToCart(p)} className="btn-primary">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
