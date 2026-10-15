import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.jsx';
import Navbar from './components/Navbar.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import NotFound from './pages/NotFound.jsx';
import './App.css';

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="spa-app-layout">
          {/* Shared Global Navigation Bar */}
          <Navbar />

          {/* Core SPA Route Outlets */}
          <main className="spa-main-container">
            <Routes>
              {/* 1. Home Page */}
              <Route path="/" element={<Home />} />

              {/* 2. Products Catalog Page */}
              <Route path="/products" element={<Products />} />

              {/* 3. Product Details Dynamic Route with Route Params (:id) */}
              <Route path="/products/:id" element={<ProductDetails />} />

              {/* 4. 404 Not Found Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Global Cart Drawer (Context API driven) */}
          <CartDrawer />

          {/* Shared Site Footer */}
          <footer className="spa-site-footer">
            <div className="footer-inner">
              <p>&copy; 2026 Rahul Raj &bull; Full Stack Lab Sheet 04 &bull; React Routing &amp; Context API State Management</p>
              <span className="footer-routes-note">SPA Engine: react-router-dom v6 &bull; Global State: React Context API</span>
            </div>
          </footer>
        </div>
      </Router>
    </StoreProvider>
  );
}
