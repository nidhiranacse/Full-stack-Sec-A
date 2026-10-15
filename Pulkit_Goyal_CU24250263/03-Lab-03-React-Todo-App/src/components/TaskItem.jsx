import React, { useState } from 'react';

/**
 * TaskItem Component
 * Single task display, completion toggle, in-place title editing, and deletion.
 */
export default function TaskItem({ task, onToggleComplete, onEditTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    const cleanTitle = editTitle.trim();
    if (cleanTitle) {
      onEditTask(task.id, cleanTitle);
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-left">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          aria-label={`Mark "${task.title}" as complete`}
        />

        {isEditing ? (
          <input
            type="text"
            className="input-text"
            style={{ padding: '4px 8px', fontSize: '0.9rem' }}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span
            className="task-title"
            onDoubleClick={() => setIsEditing(true)}
            title="Double click to edit title"
          >
            {task.title}
          </span>
        )}

        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      <div className="task-actions">
        {!isEditing && (
          <button
            className="btn-action"
            onClick={() => setIsEditing(true)}
            title="Edit task"
          >
            Edit
          </button>
        )}
        <button
          className="btn-action delete"
          onClick={() => onDeleteTask(task.id)}
          title="Delete task"
        >
          &times;
        </button>
      </div>
    </li>
  );
}
