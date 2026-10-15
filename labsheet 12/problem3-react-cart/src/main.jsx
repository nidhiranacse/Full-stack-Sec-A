import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CartProvider } from './CartContext';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
