/*function App() {
  return (
    <div>
      <h1>React Todo Application</h1>
      <p>Lab 3 - Introduction to React.js</p>
    </div>
  );
}

export default App;*/

//q2
/*import { useState } from "react";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState([]);

  const addTask = (taskText) => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask
    ]);
  };

  const toggleTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <main className="todo-container">

      <h1>Todo Application</h1>

      <p className="subtitle">
        Manage your daily tasks
      </p>

      <AddTaskForm onAddTask={addTask} />

      <TaskList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />

      <div className="task-info">

        <span>
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>

        <button
          id="clearAll"
          onClick={clearAllTasks}
        >
          Clear All
        </button>

      </div>

    </main>
  );
}

export default App;*/

//q3
/*import { useEffect, useState } from "react";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("todoTasks");

    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskText) => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask
    ]);
  };

  const toggleTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed
            }
          : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <main className="todo-container">

      <h1>Todo Application</h1>

      <p className="subtitle">
        Manage your daily tasks
      </p>

      <AddTaskForm onAddTask={addTask} />

      <TaskList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />

      <div className="task-info">

        <span>
          {tasks.length}{" "}
          {tasks.length === 1 ? "task" : "tasks"}
        </span>

        <button
          id="clearAll"
          onClick={clearAllTasks}
        >
          Clear All
        </button>

      </div>

    </main>
  );
}

export default App;*/
/*q4*/
import { useEffect, useState } from "react";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("todoTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskText) => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask
    ]);
  };

  const toggleTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed
            }
          : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <main className="todo-container">

      <h1>Todo Application</h1>

      <p className="subtitle">
        Manage your daily tasks
      </p>

      <AddTaskForm onAddTask={addTask} />

      <TaskList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />

      <div className="task-info">
        <span>
          {tasks.length}{" "}
          {tasks.length === 1 ? "task" : "tasks"}
        </span>

        <button
          id="clearAll"
          onClick={clearAllTasks}
        >
          Clear All
        </button>
      </div>

    </main>
  );
}

export default App;