import React, { useState } from 'react';

/**
 * AddTaskForm Component
 * Props:
 *   - onAddTask(taskObject): function to send newly created task to parent App
 *   - existingTasks: array used for duplicate task validation
 */
export default function AddTaskForm({ onAddTask, existingTasks }) {
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Full Stack');
  const [errorFlag, setErrorFlag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = taskText.trim();

    // 1. Operational Validation: Empty or whitespace check
    if (!trimmed) {
      setErrorFlag('Validation Error: Task description cannot be empty or contain only whitespace.');
      return;
    }

    // 2. Operational Validation: Minimum length threshold
    if (trimmed.length < 3) {
      setErrorFlag(`Validation Error: Task is too short (${trimmed.length}/3 characters minimum required).`);
      return;
    }

    // 3. Operational Validation: Duplicate check
    const isDuplicate = existingTasks.some(
      (t) => t.text.toLowerCase() === trimmed.toLowerCase() && !t.completed
    );
    if (isDuplicate) {
      setErrorFlag(`Validation Error: An active task with the title "${trimmed}" already exists.`);
      return;
    }

    // Clear error flag
    setErrorFlag('');

    const now = new Date();
    const timeFormatted =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) +
      ', ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Send data to Parent via Props Communication
    onAddTask({
      id: 'task_' + Date.now(),
      text: trimmed,
      priority,
      category,
      completed: false,
      createdAt: timeFormatted,
    });

    // Reset input
    setTaskText('');
  };

  return (
    <div className="add-task-container">
      {/* Operational Validation Error Flag Banner */}
      {errorFlag && (
        <div className="validation-flag-banner" role="alert">
          <div className="flag-content">
            <span className="flag-icon">⚠️</span>
            <span className="flag-msg">{errorFlag}</span>
          </div>
          <button
            type="button"
            className="btn-dismiss-flag"
            onClick={() => setErrorFlag('')}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-primary-row">
          <div className="input-box-wrapper">
            <input
              type="text"
              value={taskText}
              onChange={(e) => {
                setTaskText(e.target.value);
                if (errorFlag && e.target.value.trim().length >= 3) {
                  setErrorFlag('');
                }
              }}
              placeholder="What React component or full stack feature are you building?"
              className={`task-input ${errorFlag ? 'has-error' : ''}`}
            />
            <span className="input-len-counter">{taskText.length}/100</span>
          </div>

          <button type="submit" className="btn-submit-task">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Task
          </button>
        </div>

        <div className="form-secondary-row">
          <div className="select-wrapper">
            <label htmlFor="priority-select">Priority:</label>
            <select
              id="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>

          <div className="select-wrapper">
            <label htmlFor="category-select">Domain:</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Full Stack">Full Stack</option>
              <option value="React.js">React.js Components</option>
              <option value="Architecture">System Architecture</option>
              <option value="Database">Database &amp; APIs</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
