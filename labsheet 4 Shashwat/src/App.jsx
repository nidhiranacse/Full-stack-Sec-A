import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './CartContext.jsx'
import Navbar from './Navbar.jsx'
import Home from './Home.jsx'
import Products from './Products.jsx'
import ProductDetails from './ProductDetails.jsx'
import Cart from './Cart.jsx'
import NotFound from './NotFound.jsx'

/* ========================
   App Component
   - BrowserRouter for SPA routing
   - CartProvider wraps everything for global state
   - Routes define all pages + 404 catch-all
   ======================== */

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
