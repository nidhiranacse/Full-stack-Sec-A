import React from 'react';
import TaskItem from './TaskItem.jsx';

/**
 * TaskList Component
 * Renders filtered array of tasks or an informative empty state.
 */
export default function TaskList({ tasks, onToggleComplete, onEditTask, onDeleteTask }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No tasks found</p>
        <p style={{ fontSize: '0.85rem' }}>Create a new task above or adjust your filter selection.</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ul>
  );
}
