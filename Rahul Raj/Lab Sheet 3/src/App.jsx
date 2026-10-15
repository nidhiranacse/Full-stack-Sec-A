import React, { useState, useEffect } from 'react';
import AddTaskForm from './components/AddTaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import FilterTabs from './components/FilterTabs.jsx';
import TaskMetrics from './components/TaskMetrics.jsx';
import ComponentTree from './components/ComponentTree.jsx';

const LOCAL_STORAGE_KEY = 'rahul_raj_lab3_react_todos';

export default function App() {
  // 1. Hook: useState for tasks state management
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading tasks from localStorage', e);
    }
    // Default initial tasks matching syllabus context
    return [
      {
        id: 'task_react_1',
        text: 'Decompose Todo application into modular React components (TaskList, TaskItem, AddTaskForm)',
        priority: 'high',
        category: 'React.js',
        completed: true,
        createdAt: '19 Sep, 00:15',
      },
      {
        id: 'task_react_2',
        text: 'Implement useState and useEffect hooks for state synchronization and localStorage persistence',
        priority: 'high',
        category: 'Full Stack',
        completed: true,
        createdAt: '19 Sep, 00:20',
      },
      {
        id: 'task_react_3',
        text: 'Document Props-based communication flow & export Component Tree Diagram',
        priority: 'medium',
        category: 'Architecture',
        completed: false,
        createdAt: '19 Sep, 00:25',
      },
    ];
  });

  // useState for filtering view
  const [currentFilter, setCurrentFilter] = useState('all');

  // useState for toggling between Application View and Component Tree Diagram View
  const [activeTab, setActiveTab] = useState('app'); // 'app' | 'tree'

  // 2. Hook: useEffect for persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }, [tasks]);

  // 3. Props Communication Callbacks:
  const handleAddTask = (newTask) => {
    // Functional state update
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleToggleTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.completed));
  };

  // Filter computation
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  const counts = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className="react-app-root">
      {/* Top Navbar */}
      <header className="app-top-header">
        <div className="header-inner-container">
          <div className="left-brand">
            <a href="../index.html" className="btn-portal-back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Lab Portal
            </a>
            <span className="badge-pill">Lab Sheet 03 &bull; React.js</span>
          </div>

          <div className="center-tabs">
            <button
              className={`view-toggle-btn ${activeTab === 'app' ? 'active' : ''}`}
              onClick={() => setActiveTab('app')}
            >
              ⚛️ React Todo Application
            </button>
            <button
              className={`view-toggle-btn ${activeTab === 'tree' ? 'active' : ''}`}
              onClick={() => setActiveTab('tree')}
            >
              🌳 Component Tree Diagram
            </button>
          </div>

          <div className="student-info">
            <span>Author: <strong>Rahul Raj</strong></span>
          </div>
        </div>
      </header>

      <main className="main-content-wrapper">
        {/* Intro Header */}
        <section className="app-hero-header">
          <span className="hero-kicker">Lab 3 — Introduction to React.js</span>
          <h1 className="hero-heading">Component-Based Front End with React</h1>
          <p className="hero-subline">
            Engineered using modular React components (<code className="code-tag">&lt;TaskList&gt;</code>,{' '}
            <code className="code-tag">&lt;TaskItem&gt;</code>,{' '}
            <code className="code-tag">&lt;AddTaskForm&gt;</code>), explicit props-based communication, and{' '}
            <code className="code-tag">useState</code> + <code className="code-tag">useEffect</code> persistence hooks.
          </p>
        </section>

        {activeTab === 'app' ? (
          <div className="todo-react-card">
            {/* Child Component 1: AddTaskForm */}
            <AddTaskForm onAddTask={handleAddTask} existingTasks={tasks} />

            {/* Child Component 2: FilterTabs */}
            <FilterTabs
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              counts={counts}
              onClearCompleted={handleClearCompleted}
            />

            {/* Child Component 3: TaskList */}
            <TaskList
              tasks={filteredTasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />

            {/* Child Component 4: TaskMetrics */}
            <TaskMetrics tasks={tasks} />
          </div>
        ) : (
          /* Deliverable: Component Tree Diagram */
          <ComponentTree />
        )}
      </main>

      <footer className="react-app-footer">
        <p>&copy; 2026 Rahul Raj &bull; Full Stack Lab Sheet 03 &bull; Component-Based Front End using React.js</p>
      </footer>
    </div>
  );
}
