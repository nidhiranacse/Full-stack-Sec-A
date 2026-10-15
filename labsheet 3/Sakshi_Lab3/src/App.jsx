import { useEffect, useState } from "react";
import TaskList from "./components/TaskList";
import AddTaskForm from "./components/AddTaskForm";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("pinkTodoTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("pinkTodoTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskText) => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };

    setTasks((previousTasks) => [...previousTasks, newTask]);
  };

  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );
  };

  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  return (
    <div className="app">
      <div className="todo-container">
        <div className="header">
          <div className="rabbit">🐰</div>
          <h1>TO-DO YOUR TASKS</h1>
          <p>Organize your day beautifully ✨</p>
        </div>

        <AddTaskForm addTask={addTask} />

        <TaskList
          tasks={tasks}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
        />

        <div className="footer">
          <span>{tasks.length} task(s)</span>
          <span>Made with ♡</span>
        </div>
      </div>
    </div>
  );
}

export default App;