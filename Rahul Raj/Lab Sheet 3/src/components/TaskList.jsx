import React from 'react';
import TaskItem from './TaskItem.jsx';

/**
 * TaskList Component
 * Props:
 *   - tasks: array of tasks
 *   - onToggleTask(id): passed down to TaskItem
 *   - onDeleteTask(id): passed down to TaskItem
 */
export default function TaskList({ tasks, onToggleTask, onDeleteTask }) {
  if (tasks.length === 0) {
    return (
      <div className="tasks-empty-state">
        <span className="empty-icon">⚛️</span>
        <h3>No Tasks in this Filter View</h3>
        <p>Add a new task using the form above or switch filters to view all tasks.</p>
      </div>
    );
  }

  return (
    <ul className="tasks-list-element">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
        />
      ))}
    </ul>
  );
}
