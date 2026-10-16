import { useEffect, useRef, useState } from "react";

import SearchBar from "./components/SearchBar";
import ProductList from "./components/ProductList";
import Pagination from "./components/Pagination";
import Cart from "./components/Cart";

import { fetchProducts } from "./api/mockApi";

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const requestId = useRef(0);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const currentRequestId = ++requestId.current;

      setLoading(true);

      try {
        const result = await fetchProducts(
          query,
          page
        );

        if (
          currentRequestId !== requestId.current
        ) {
          return;
        }

        setProducts(result.products);
        setTotalPages(result.totalPages);
      } catch (error) {
        if (
          currentRequestId !== requestId.current
        ) {
          return;
        }

        console.error(error);
        setProducts([]);
        setTotalPages(1);
      } finally {
        if (
          currentRequestId === requestId.current
        ) {
          setLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, page]);

  const handlePrevious = () => {
    setPage((currentPage) =>
      Math.max(1, currentPage - 1)
    );
  };

  const handleNext = () => {
    setPage((currentPage) =>
      Math.min(totalPages, currentPage + 1)
    );
  };

  return (
    <div className="app">
      <header>
        <h1>Product Search & Cart</h1>
        <p>
          Search products and add them to your cart
        </p>
      </header>

      <SearchBar
        query={query}
        setQuery={setQuery}
      />

      <main className="content">
        <section className="products-section">
          <h2>Products</h2>

          <ProductList
            products={products}
            loading={loading}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </section>

        <Cart />
      </main>
    </div>
  );
}

export default App;
