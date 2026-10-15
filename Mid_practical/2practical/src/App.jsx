import React from 'react';
import Cart from './Cart';

const sampleProducts = [
  { id: 1, name: 'Wireless Headphones', price: 170.0 },
  { id: 2, name: 'Mechanical Keyboard', price: 350.0 },
  { id: 3, name: 'Gaming Monitor', price: 1000.0 },
  { id: 4, name: 'Ergonomic Mouse', price: 80.0 },
];

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Shopping Cart with Discount</h1>
        <p className="subtitle">
          Add items, adjust quantities, and get 10% discount on orders of ₹1000.00 or more!
        </p>
      </header>
      <main>
        <Cart products={sampleProducts} />
      </main>
    </div>
  );
}
