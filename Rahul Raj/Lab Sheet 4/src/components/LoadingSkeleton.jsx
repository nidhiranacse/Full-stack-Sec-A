import React from 'react';

/**
 * LoadingSkeleton Component
 * Fulfills syllabus requirement: Add a loading state
 */
export default function LoadingSkeleton({ message = 'Loading developer specs and catalog...' }) {
  return (
    <div className="loading-skeleton-container" role="status" aria-live="polite">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
      <div className="skeleton-cards-row">
        <div className="skeleton-block shimmer"></div>
        <div className="skeleton-block shimmer"></div>
        <div className="skeleton-block shimmer"></div>
      </div>
    </div>
  );
}
