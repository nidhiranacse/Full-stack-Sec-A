import React, { useState } from 'react';

/**
 * AddTaskForm Component
 * Manages form state and validation before dispatching onAddTask to parent.
 */
export default function AddTaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Academic');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onAddTask({
      id: Date.now().toString(),
      title: cleanTitle,
      priority,
      category,
      completed: false,
      createdAt: new Date().toLocaleDateString()
    });

    setTitle('');
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="input-row">
        <input
          type="text"
          className="input-text"
          placeholder="What needs to be done? (e.g. Complete Lab Sheet 4)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <select
          className="select-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          className="select-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Academic">Academic</option>
          <option value="Project">Project</option>
          <option value="Personal">Personal</option>
        </select>

        <button type="submit" className="btn-add">
          + Add
        </button>
      </div>
    </form>
  );
}
