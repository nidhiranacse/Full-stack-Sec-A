import React from 'react';
import Cart from './Cart';

const sampleProducts = [
  { id: 1, name: 'Keyboard', price: 100 },
  { id: 2, name: 'Mouse', price: 70 },
  { id: 3, name: 'Monitor', price: 300 },
  { id: 4, name: 'Headphones', price: 250 },
  { id: 5, name: 'USB-C Dock', price: 500 },
];

export default function App() {
  return (
    <div className="app-container">
      <Cart products={sampleProducts} />
    </div>
  );
}
