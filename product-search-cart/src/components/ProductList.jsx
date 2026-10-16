import ProductCard from "./ProductCard";

function ProductList({ products, loading }) {
  if (loading) {
    return (
      <div className="status">
        Loading...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="status">
        No results
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductList;
