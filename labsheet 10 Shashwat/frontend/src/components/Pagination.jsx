export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Compute which page numbers to show (window of up to 5)
  let start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="pagination">
      <button
        className="pg-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >‹</button>

      {start > 1 && (
        <>
          <button className="pg-btn" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="pg-info">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pg-btn ${p === page ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
          id={`page-btn-${p}`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="pg-info">…</span>}
          <button className="pg-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className="pg-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >›</button>

      <span className="pg-info">Page {page} / {totalPages}</span>
    </div>
  );
}
