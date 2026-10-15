import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['all', 'Computing', 'Audio', 'Peripherals', 'Displays'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const matchesCat =
          selectedCategory === 'all' || prod.category === selectedCategory;
        const matchesQuery =
          searchQuery === '' ||
          prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.tagline.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // default featured
      });
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat });
    }
  };

  return (
    <div className="page-products-root">
      <div className="catalog-header-wrap">
        <span className="cat-pill">Full Stack Catalog</span>
        <h1 className="catalog-title">Developer Systems &amp; Hardware</h1>
        <p className="catalog-desc">
          Browse items, inspect specifications, and test global state operations with immediate routing transitions.
        </p>

        {/* Toolbar: Category Chips, Search, and Sort */}
        <div className="catalog-toolbar-panel">
          <div className="search-bar-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by title, processor, audio, keyboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catalog products"
            />
            {searchQuery && (
              <button
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          <div className="toolbar-bottom-row">
            <div className="category-filter-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat === 'all' ? 'All Products' : cat}
                </button>
              ))}
            </div>

            <div className="sort-selector-wrap">
              <label htmlFor="sort-dropdown">Sort:</label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products-view">
          <span className="no-prod-icon">🔍</span>
          <h3>No matching products found</h3>
          <p>Try resetting your search query or choosing another category filter.</p>
          <button
            className="btn-reset-filters"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="products-cards-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
