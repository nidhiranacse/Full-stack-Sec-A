import { useEffect, useState } from "react";
import TaskList from "./components/TaskList";
import AddTaskForm from "./components/AddTaskForm";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = text => setTasks([...tasks, { id: Date.now(), text, done: false }]);

  const toggleTask = id => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTask = id => setTasks(tasks.filter(t => t.id !== id));

  return (
    <div className="app">
      <h1>React Todo App</h1>
      <p>Lab 3 - Introduction to React.js</p>
      <AddTaskForm addTask={addTask} />
      <TaskList tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />
    </div>
  );
}

export default App;