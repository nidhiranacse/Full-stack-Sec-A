import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import CartPage from './pages/CartPage.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Root Application - Lab Sheet 4
 * Student: Pulkit Goyal | CU24250263 | Roll 40 | Sec A
 */
export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer>
            <p><strong>Full Stack Web Development &bull; Lab Sheet 4</strong></p>
            <p>Prepared by: <strong>Pulkit Goyal</strong> (CUID: <strong>CU24250263</strong> | Roll: <strong>40</strong> | Section: <strong>A</strong>)</p>
          </footer>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
