import React, { useState, useEffect } from 'react';
import TaskHeader from './components/TaskHeader.jsx';
import AddTaskForm from './components/AddTaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';

/**
 * Root Application Component - Lab Sheet 3
 * Student: Pulkit Goyal | CU24250263 | Roll 40 | Sec A
 */
export default function App() {
  // Initial default tasks for demonstration
  const defaultTasks = [
    { id: '1', title: 'Complete Lab Sheet 1 (Semantic HTML5)', priority: 'High', category: 'Academic', completed: true, createdAt: '2026-10-10' },
    { id: '2', title: 'Implement Lab Sheet 2 (CSS Grid & Flexbox)', priority: 'High', category: 'Academic', completed: true, createdAt: '2026-10-11' },
    { id: '3', title: 'Build React Todo State Manager (Lab 3)', priority: 'Medium', category: 'Academic', completed: false, createdAt: '2026-10-12' },
    { id: '4', title: 'Design CampusConnect Event Schema (Project 2)', priority: 'High', category: 'Project', completed: false, createdAt: '2026-10-13' }
  ];

  // State: tasks (with localStorage initialization)
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('pulkit_todo_tasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });

  // State: filter & search
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pulkit_todo_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to sync tasks to localStorage', e);
    }
  }, [tasks]);

  // Handler: Add Task
  const handleAddTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Handler: Toggle Task Completion
  const handleToggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Handler: Edit Task Title
  const handleEditTask = (id, newTitle) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
  };

  // Handler: Delete Single Task
  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler: Clear All Completed
  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Computed filtered list
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === 'All' ? true : filter === 'Active' ? !task.completed : task.completed;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="todo-app">
      <div className="card">
        <TaskHeader
          totalCount={tasks.length}
          completedCount={completedCount}
        />

        <AddTaskForm onAddTask={handleAddTask} />

        <TaskFilters
          activeFilter={filter}
          onFilterChange={setFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearCompleted={handleClearCompleted}
          hasCompleted={completedCount > 0}
        />

        <TaskList
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
