import React from 'react';

/**
 * TaskMetrics Component
 * Props:
 *   - tasks: array of all tasks
 */
export default function TaskMetrics({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="metrics-grid">
      <div className="metric-box">
        <span className="metric-digit">{total}</span>
        <span className="metric-name">Total Tasks</span>
      </div>
      <div className="metric-box amber">
        <span className="metric-digit">{active}</span>
        <span className="metric-name">Active Pending</span>
      </div>
      <div className="metric-box green">
        <span className="metric-digit">{completed}</span>
        <span className="metric-name">Completed</span>
      </div>
      <div className="metric-box indigo">
        <span className="metric-digit">{rate}%</span>
        <span className="metric-name">Completion Rate</span>
      </div>
    </div>
  );
}
