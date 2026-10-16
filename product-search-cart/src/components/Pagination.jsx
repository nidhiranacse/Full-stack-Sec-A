function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext
}) {
  return (
    <div className="pagination">
      <button
        onClick={onPrevious}
        disabled={page === 1}
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        data-testid="next-btn"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
