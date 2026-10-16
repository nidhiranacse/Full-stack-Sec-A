function SearchBar({ query, setQuery }) {
  return (
    <div className="search-container">
      <input
        type="text"
        data-testid="search-input"
        placeholder="Search products..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </div>
  );
}

export default SearchBar;
