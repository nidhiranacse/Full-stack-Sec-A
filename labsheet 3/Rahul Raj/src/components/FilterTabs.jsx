import React from 'react';

/**
 * FilterTabs Component
 * Props:
 *   - currentFilter: 'all' | 'active' | 'completed'
 *   - onFilterChange(filter): callback to parent
 *   - counts: { total, active, completed }
 *   - onClearCompleted(): callback to parent
 */
export default function FilterTabs({ currentFilter, onFilterChange, counts, onClearCompleted }) {
  return (
    <div className="filter-controls-bar">
      <div className="tab-buttons">
        <button
          className={`tab-btn ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All ({counts.total})
        </button>
        <button
          className={`tab-btn ${currentFilter === 'active' ? 'active' : ''}`}
          onClick={() => onFilterChange('active')}
        >
          Active ({counts.active})
        </button>
        <button
          className={`tab-btn ${currentFilter === 'completed' ? 'active' : ''}`}
          onClick={() => onFilterChange('completed')}
        >
          Completed ({counts.completed})
        </button>
      </div>

      {counts.completed > 0 && (
        <button className="btn-clear-done" onClick={onClearCompleted}>
          Clear Completed ({counts.completed})
        </button>
      )}
    </div>
  );
}
