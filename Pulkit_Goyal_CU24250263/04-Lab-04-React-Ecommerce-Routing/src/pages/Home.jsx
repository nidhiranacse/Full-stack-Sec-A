import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import { useCart } from '../context/CartContext.jsx';

export default function Home() {
  const { addToCart } = useCart();
  const featured = products.slice(0, 3);

  return (
    <div>
      <section className="store-hero">
        <h1 style={{ margin: 0, fontSize: '2.4rem' }}>Welcome to TechMart E-Store</h1>
        <p style={{ marginTop: '10px', fontSize: '1.1rem', opacity: 0.9 }}>
          Full Stack Development &bull; Lab Sheet 4: React Routing &amp; Context State
        </p>

        <div className="hero-tags">
          <span className="tag-pill">Student: Pulkit Goyal</span>
          <span className="tag-pill">CUID: CU24250263</span>
          <span className="tag-pill">Roll: 40</span>
          <span className="tag-pill">Section: A</span>
        </div>

        <div style={{ marginTop: '24px' }}>
          <Link to="/products" className="btn-primary" style={{ background: 'white', color: '#2563eb', padding: '12px 24px' }}>
            Browse All Products &rarr;
          </Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Featured Gear &amp; Resources</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Hand-picked productivity items for developers and students.</p>

        <div className="product-grid">
          {featured.map((p) => (
            <div key={p.id} className="prod-card">
              <div className="prod-card-thumb">{p.image}</div>
              <div className="prod-card-body">
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>
                    {p.category}
                  </span>
                  <h3 style={{ margin: '6px 0 10px', fontSize: '1.15rem' }}>{p.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '14px' }}>
                    {p.description.substring(0, 75)}...
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{p.price.toLocaleString()}</span>
                    <span style={{ fontSize: '0.85rem', color: '#f59e0b' }}>★ {p.rating}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/products/${p.id}`} className="btn-outline" style={{ flex: 1 }}>
                      View Details
                    </Link>
                    <button onClick={() => addToCart(p)} className="btn-primary">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
