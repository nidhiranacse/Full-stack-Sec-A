import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";

import { CartProvider } from "./context/CartContext";

function App() {

  return (

    <BrowserRouter>

      <CartProvider>

        <Navbar />

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </CartProvider>

    </BrowserRouter>

  );
}

export default App;