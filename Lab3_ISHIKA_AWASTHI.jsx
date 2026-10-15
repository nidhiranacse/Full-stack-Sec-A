import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const styles = `
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#1f2937}
.app{min-height:100vh;padding:40px 20px}
.container{max-width:750px;margin:auto;background:white;padding:32px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.08)}
h1{text-align:center;color:#2563eb;margin-top:0}
.subtitle{text-align:center;color:#64748b}
form{display:flex;gap:10px;margin:25px 0}
input{flex:1;padding:13px;border:1px solid #cbd5e1;border-radius:8px;font-size:16px}
button{border:0;border-radius:8px;padding:12px 18px;cursor:pointer;font-weight:600}
.add{background:#2563eb;color:white}
.task{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;margin:10px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px}
.task-text{cursor:pointer;flex:1}
.completed{text-decoration:line-through;color:#94a3b8}
.delete{background:#ef4444;color:white;padding:8px 12px}
.empty{text-align:center;color:#94a3b8;padding:20px}
.footer{text-align:center;color:#64748b;margin-top:25px;font-size:14px}
`;

function AddTaskForm({ addTask }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    addTask(text.trim());
    setText("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a task..."
      />
      <button className="add" type="submit">Add Task</button>
    </form>
  );
}

function TaskItem({ task, toggleTask, deleteTask }) {
  return (
    <div className="task">
      <span
        className={`task-text ${task.completed ? "completed" : ""}`}
        onClick={() => toggleTask(task.id)}
      >
        {task.text}
      </span>
      <button className="delete" onClick={() => deleteTask(task.id)}>
        Delete
      </button>
    </div>
  );
}

function TaskList({ tasks, toggleTask, deleteTask }) {
  if (tasks.length === 0) {
    return <div className="empty">No tasks yet. Add your first task.</div>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
        />
      ))}
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lab3-tasks")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("lab3-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask(text) {
    setTasks((oldTasks) => [
      ...oldTasks,
      { id: Date.now(), text, completed: false }
    ]);
  }

  function toggleTask(id) {
    setTasks((oldTasks) =>
      oldTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((oldTasks) => oldTasks.filter((task) => task.id !== id));
  }

  const completed = tasks.filter((task) => task.completed).length;

  return (
    <div className="app">
      <style>{styles}</style>
      <div className="container">
        <h1>React To-Do App</h1>
        <p className="subtitle">
          Lab 3 — Components, Props, useState and useEffect
        </p>

        <AddTaskForm addTask={addTask} />

        <TaskList
          tasks={tasks}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
        />

        <div className="footer">
          Total Tasks: {tasks.length} | Completed: {completed}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
