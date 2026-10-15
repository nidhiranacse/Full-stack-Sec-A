import React, { useState, useEffect } from "react";

function TaskItem({ task, onComplete, onDelete }) {
  return (
    <div className="task-item">
      <button
        className={`check-btn ${task.completed ? "checked" : ""}`}
        onClick={() => onComplete(task.id)}
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="task-content">
        <span className={task.completed ? "completed" : ""}>
          {task.text}
        </span>

        <small>Added today</small>
      </div>

      <span
        className={`status ${
          task.completed ? "done" : "pending"
        }`}
      >
        {task.completed ? "Completed" : "Pending"}
      </span>

      <button
        className="delete-btn"
        onClick={() => onDelete(task.id)}
        title="Delete task"
      >
        🗑
      </button>
    </div>
  );
}

function TaskList({ tasks, onComplete, onDelete }) {
  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✓</div>
          <h3>All caught up!</h3>
          <p>You don't have any tasks right now.</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

function AddTaskForm({ onAddTask }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const task = input.trim();

    if (task === "") {
      setError("Please enter a task.");
      return;
    }

    if (task.length < 3) {
      setError("Task must contain at least 3 characters.");
      return;
    }

    onAddTask(task);
    setInput("");
    setError("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="add-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
        />

        <button type="submit" className="add-btn">
          <span>+</span>
          Add Task
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("taskMasterTasks");

    if (saved) {
      return JSON.parse(saved);
    }

    return [
      {
        id: 1,
        text: "Complete React project",
        completed: true
      },
      {
        id: 2,
        text: "Study Data Structures",
        completed: false
      },
      {
        id: 3,
        text: "Go to the Gym",
        completed: false
      },
      {
        id: 4,
        text: "Read a book",
        completed: true
      },
      {
        id: 5,
        text: "Learn SQL",
        completed: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(
      "taskMasterTasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  const addTask = (text) => {
    const newTask = {
      id: Date.now(),
      text: text,
      completed: false
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask
    ]);
  };

  const completeTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed
            }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter(
        (task) => task.id !== id
      )
    );
  };

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f7fc;
          color: #17233c;
        }

        .app {
          min-height: 100vh;
        }

        .header {
          background: linear-gradient(
            120deg,
            #1769ff,
            #7144e8,
            #c832c8
          );
          color: white;
          padding: 28px 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo {
          width: 42px;
          height: 42px;
          background: white;
          color: #1769ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: bold;
        }

        .brand h1 {
          margin: 0;
          font-size: 30px;
        }

        .greeting {
          font-size: 17px;
        }

        .layout {
          max-width: 1250px;
          margin: 28px auto;
          padding: 0 25px;
          display: grid;
          grid-template-columns: 270px 1fr;
          gap: 25px;
        }

        .sidebar,
        .main-card {
          background: white;
          border-radius: 18px;
          box-shadow: 0 5px 25px rgba(30, 45, 80, 0.08);
        }

        .sidebar {
          padding: 25px;
          height: fit-content;
        }

        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px;
          margin-bottom: 7px;
          border-radius: 10px;
          font-size: 16px;
        }

        .menu-item.active {
          background: #f0f4ff;
          color: #1769ff;
        }

        .menu-left {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .count {
          background: #1769ff;
          color: white;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .completed-count {
          background: #18a957;
        }

        .pending-count {
          background: #ff8a00;
        }

        .divider {
          border: 0;
          border-top: 1px solid #e5e8ef;
          margin: 20px 0;
        }

        .sidebar h3 {
          color: #5635df;
          margin-bottom: 18px;
        }

        .stat {
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .stat.total {
          background: #f1f4ff;
          color: #315de7;
        }

        .stat.done {
          background: #effbf4;
          color: #16a05a;
        }

        .stat.pending {
          background: #fff7eb;
          color: #ed8100;
        }

        .stat-label {
          font-size: 14px;
          margin-bottom: 6px;
        }

        .stat-number {
          font-size: 26px;
          font-weight: bold;
          color: #17233c;
        }

        .main-card {
          padding: 36px;
        }

        .main-card h2 {
          font-size: 32px;
          margin: 0 0 8px;
        }

        .subtitle {
          color: #68758e;
          margin: 0 0 25px;
          font-size: 16px;
        }

        .add-form {
          display: flex;
          gap: 12px;
        }

        .add-form input {
          flex: 1;
          padding: 16px;
          border: 1px solid #d8deea;
          border-radius: 10px;
          font-size: 16px;
          outline: none;
        }

        .add-form input:focus {
          border-color: #1769ff;
        }

        .add-btn {
          border: 0;
          border-radius: 10px;
          padding: 0 25px;
          background: linear-gradient(
            120deg,
            #1769ff,
            #7b38d9
          );
          color: white;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
        }

        .add-btn span {
          font-size: 22px;
          margin-right: 7px;
        }

        .error {
          color: #e53935;
          margin-bottom: 0;
        }

        .task-list {
          margin-top: 25px;
          border-top: 1px solid #e5e8ef;
          padding-top: 12px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 17px;
          margin: 12px 0;
          border: 1px solid #e1e5ec;
          border-radius: 13px;
          transition: 0.2s;
        }

        .task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(30, 45, 80, 0.08);
        }

        .check-btn {
          width: 28px;
          height: 28px;
          border: 2px solid #1769ff;
          border-radius: 6px;
          background: white;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }

        .check-btn.checked {
          background: #18aa59;
          border-color: #18aa59;
        }

        .task-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .task-content span {
          font-size: 17px;
        }

        .task-content small {
          color: #8290a8;
        }

        .completed {
          text-decoration: line-through;
          color: #7b8495;
        }

        .status {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: bold;
        }

        .status.done {
          color: #11954d;
          background: #eaf9f0;
        }

        .status.pending {
          color: #1558d6;
          background: #edf3ff;
        }

        .delete-btn {
          width: 40px;
          height: 40px;
          border: 1px solid #e3e7ee;
          background: white;
          border-radius: 9px;
          cursor: pointer;
          font-size: 17px;
        }

        .delete-btn:hover {
          background: #fff0f0;
        }

        .empty {
          text-align: center;
          padding: 60px 20px;
          color: #7b8495;
        }

        .empty-icon {
          width: 55px;
          height: 55px;
          margin: auto;
          border-radius: 50%;
          background: #eaf9f0;
          color: #18a957;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .footer {
          text-align: center;
          padding: 25px;
          color: #6c7890;
        }

        @media (max-width: 850px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .header {
            padding: 20px;
          }

          .greeting {
            display: none;
          }

          .layout {
            margin-top: 15px;
            padding: 10px;
          }

          .main-card {
            padding: 22px;
          }

          .add-form {
            flex-direction: column;
          }

          .add-btn {
            padding: 14px;
          }

          .status {
            display: none;
          }
        }
      `}</style>

      <div className="app">

        <header className="header">
          <div className="brand">
            <div className="logo">✓</div>
            <h1>TaskMaster</h1>
          </div>

          <div className="greeting">
            ☀️ Good Morning!
          </div>
        </header>


        <div className="layout">

          <aside className="sidebar">

            <div className="menu-item active">
              <div className="menu-left">
                <span>☷</span>
                <span>All Tasks</span>
              </div>

              <span className="count">
                {tasks.length}
              </span>
            </div>


            <div className="menu-item">
              <div className="menu-left">
                <span>✓</span>
                <span>Completed</span>
              </div>

              <span className="count completed-count">
                {completedCount}
              </span>
            </div>


            <div className="menu-item">
              <div className="menu-left">
                <span>◷</span>
                <span>Pending</span>
              </div>

              <span className="count pending-count">
                {pendingCount}
              </span>
            </div>


            <hr className="divider" />

            <h3>Quick Stats</h3>


            <div className="stat total">
              <div className="stat-label">
                Total Tasks
              </div>

              <div className="stat-number">
                {tasks.length}
              </div>
            </div>


            <div className="stat done">
              <div className="stat-label">
                Completed
              </div>

              <div className="stat-number">
                {completedCount}
              </div>
            </div>


            <div className="stat pending">
              <div className="stat-label">
                Pending
              </div>

              <div className="stat-number">
                {pendingCount}
              </div>
            </div>

          </aside>


          <main className="main-card">

            <h2>My Tasks</h2>

            <p className="subtitle">
              Stay organized and get things done!
            </p>


            <AddTaskForm
              onAddTask={addTask}
            />


            <TaskList
              tasks={tasks}
              onComplete={completeTask}
              onDelete={deleteTask}
            />


            <div className="footer">
              🚀 Small steps every day lead to big results!
            </div>

          </main>

        </div>

      </div>
    </>
  );
}

export default App;