import React from 'react';

/**
 * TaskItem Component
 * Props:
 *   - task: task data object
 *   - onToggle(id): callback to parent
 *   - onDelete(id): callback to parent
 */
export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item-card ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="task-checkbox"
        aria-label={`Mark task ${task.text} as completed`}
      />

      <div className="task-content">
        <span className="task-title">{task.text}</span>
        <div className="task-meta-row">
          <span className={`badge-priority priority-${task.priority}`}>
            {task.priority.toUpperCase()}
          </span>
          <span className="badge-category">{task.category}</span>
          <span className="task-time">&bull; {task.createdAt}</span>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="btn-task-delete"
        title="Delete Task"
        aria-label={`Delete task ${task.text}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </li>
  );
}
