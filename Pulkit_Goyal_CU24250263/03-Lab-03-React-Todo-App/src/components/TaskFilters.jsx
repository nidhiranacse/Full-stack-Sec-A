import React from 'react';

/**
 * TaskFilters Component
 * Provides filter pills (All, Active, Completed) and quick search box.
 */
export default function TaskFilters({ activeFilter, onFilterChange, searchTerm, onSearchChange, onClearCompleted, hasCompleted }) {
  const filters = ['All', 'Active', 'Completed'];

  return (
    <div className="filter-row">
      <div className="filter-buttons">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`btn-filter ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Filter by keyword..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {hasCompleted && (
          <button
            className="btn-action"
            style={{ color: '#ef4444' }}
            onClick={onClearCompleted}
            title="Remove all completed tasks"
          >
            Clear Done
          </button>
        )}
      </div>
    </div>
  );
}
