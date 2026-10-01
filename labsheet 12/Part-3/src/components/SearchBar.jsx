export default function SearchBar({ query, onChange }) {
  return (
    <div className="search-bar">
      <div className="search-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search products…"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    </div>
  );
}
