import { useState, useEffect } from 'react'

/* ========================
   AddTaskForm Component
   - Props: onAddTask (function to add a new task)
   ======================== */

function AddTaskForm({ onAddTask }) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    const text = inputValue.trim()
    if (text === '') {
      setError(true)
      return
    }
    setError(false)
    onAddTask(text)
    setInputValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="todo-input">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a task..."
      />
      <button onClick={handleSubmit}>Add Task</button>
      {error && <p className="error-message">Please enter a task before adding it.</p>}
    </div>
  )
}


/* ========================
   TaskItem Component
   - Props: task (object), onToggle, onDelete
   ======================== */

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li>
      <span
        className={`task-text ${task.completed ? 'completed' : ''}`}
        onClick={() => onToggle(task.id)}
      >
        {task.text}
      </span>
      <button className="delete-button" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </li>
  )
}


/* ========================
   TaskList Component
   - Props: tasks (array), onToggle, onDelete
   ======================== */

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty-message">No tasks yet. Add one above!</p>
  }

  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}


/* ========================
   App Component (Parent)
   - Manages all state with useState
   - Persists tasks to localStorage with useEffect
   - Passes props down to child components
   ======================== */

function App() {
  // Load tasks from localStorage on initial render
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('react-todo-tasks')
    return saved ? JSON.parse(saved) : []
  })

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('react-todo-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Add a new task
  const addTask = (text) => {
    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
    }
    setTasks([...tasks, newTask])
  }

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  // Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  return (
    <div className="app">
      <h1>My Todo List</h1>
      <p className="subtitle">Add, complete and remove your daily tasks.</p>

      <div className="todo-container">
        <AddTaskForm onAddTask={addTask} />
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
      </div>
    </div>
  )
}

export default App
