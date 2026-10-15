import React from 'react';

/**
 * TaskHeader Component
 * Displays application title, student details, and live completion statistics.
 */
export default function TaskHeader({ totalCount, completedCount }) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="app-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>Task Flow &bull; React Todo</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Full Stack Development Lab Sheet 3
          </p>
        </div>
      </div>

      {/* Student Identity Tags */}
      <div className="student-tag-bar">
        <span className="tag">Student: Pulkit Goyal</span>
        <span className="tag">CUID: CU24250263</span>
        <span className="tag">Roll No: 40</span>
        <span className="tag">Section: A</span>
      </div>

      {/* Live Metrics */}
      <div className="stats-bar">
        <span><strong>Total Tasks:</strong> {totalCount}</span>
        <span><strong>Completed:</strong> {completedCount} of {totalCount}</span>
        <span><strong>Progress:</strong> {percentage}%</span>
      </div>
    </header>
  );
}
