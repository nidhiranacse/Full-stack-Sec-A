import ProductCard from "./ProductCard";

export default function ProductList({
  products,
  loading,
  page,
  hasMore,
  onPageChange,
}) {
  return (
    <section className="product-section">
      {/* ── Loading state ── */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Searching…</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && products.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>No results</p>
        </div>
      )}

      {/* ── Product grid ── */}
      {!loading && products.length > 0 && (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && products.length > 0 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Previous
          </button>
          <span className="page-indicator">Page {page}</span>
          <button
            data-testid="next-btn"
            className="page-btn"
            disabled={!hasMore}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
