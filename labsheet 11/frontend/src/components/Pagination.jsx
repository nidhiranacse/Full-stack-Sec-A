import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '2.5rem',
      padding: '1rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Showing page <strong style={{ color: '#fff' }}>{currentPage}</strong> of{' '}
        <strong style={{ color: '#fff' }}>{totalPages}</strong> {totalItems !== undefined && `(${totalItems} total items)`}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.25rem' }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span style={{
          padding: '0.35rem 0.75rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--primary)',
          borderRadius: '6px',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          {currentPage}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.25rem' }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
