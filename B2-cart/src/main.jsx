import React from 'react';
import { createRoot } from 'react-dom/client';
import Cart from './Cart.jsx';

const products = [
  { id: 1, name: 'Keyboard', price: 120 },
  { id: 2, name: 'Mouse', price: 50 },
  { id: 3, name: 'Monitor', price: 900 },
];

createRoot(document.getElementById('root')).render(<Cart products={products} />);
