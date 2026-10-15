import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>The requested product does not exist in our catalog.</p>
        <Link to="/products" className="btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}
      >
        &larr; Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', borderRadius: '8px' }}>
          {product.image}
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>
            {product.category}
          </span>
          <h1 style={{ margin: '8px 0 12px', fontSize: '1.75rem' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{product.price.toLocaleString()}</span>
            <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>★ {product.rating} / 5.0</span>
          </div>

          <p style={{ color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
            {product.description}
          </p>

          <div style={{ marginBottom: '20px', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
            ✓ In Stock ({product.stock} units available)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <label htmlFor="qty-select" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity:</label>
            <select
              id="qty-select"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd} className="btn-primary" style={{ flex: 1 }}>
              {added ? '✓ Added to Cart!' : `Add ${qty} to Cart`}
            </button>
            <Link to="/cart" className="btn-outline">
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
