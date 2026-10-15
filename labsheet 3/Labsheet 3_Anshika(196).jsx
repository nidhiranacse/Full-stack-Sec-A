import React, { useEffect, useState } from "react";

function AddTaskForm({ addTask }) {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!task.trim()) {
      alert("Please enter a task!");
      return;
    }

    addTask(task.trim(), priority);

    setTask("");
    setPriority("Medium");
  };

  return (
    <div className="add-card">
      <div className="section-title">
        <div className="plus-icon">＋</div>

        <div>
          <h2>Add New Task</h2>
          <p>Create a task and choose its priority</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>

        <button type="submit">Add Task +</button>
      </form>
    </div>
  );
}


function TaskItem({ task, toggleTask, deleteTask }) {
  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>

      <button
        className="check-btn"
        onClick={() => toggleTask(task.id)}
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="task-content">
        <h3>{task.text}</h3>

        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority} Priority
        </span>
      </div>

      <button
        className="delete-btn"
        onClick={() => deleteTask(task.id)}
      >
        🗑
      </button>

    </div>
  );
}

function TaskList({ tasks, toggleTask, deleteTask }) {

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h2>No Tasks Found</h2>
        <p>Add your first task and start being productive!</p>
      </div>
    );
  }

  return (
    <section className="task-section">

      <div className="task-heading">
        <div>
          <small>YOUR TASKS</small>
          <h2>Today's Tasks</h2>
        </div>

        <span className="task-count">
          {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
        </span>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        ))}
      </div>

    </section>
  );
}

function App() {

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("lab3Tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("lab3Tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text, priority) => {
    const newTask = {
      id: Date.now(),
      text: text,
      priority: priority,
      completed: false
    };

    setTasks((oldTasks) => [...oldTasks, newTask]);
  };

  const toggleTask = (id) => {
    setTasks((oldTasks) =>
      oldTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((oldTasks) =>
      oldTasks.filter((task) => task.id !== id)
    );
  };


  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(search.toLowerCase())
  );



  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);


  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: Arial, sans-serif;
          background: #080a12;
          color: white;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        .app {
          min-height: 100vh;
          padding-bottom: 30px;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(115, 85, 255, .20),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 20%,
              rgba(0, 210, 255, .10),
              transparent 30%
            ),
            #080a12;
        }


        /* HEADER */

        header {
          max-width: 1100px;
          margin: auto;
          padding: 50px 25px 35px;

          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: #9b8cff;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        header h1 {
          font-size: 50px;
          letter-spacing: -2px;
        }

        header h1 span {
          color: #8d7cff;
        }

        .subtitle {
          color: #858b9d;
          margin-top: 10px;
        }

        .react-logo {
          width: 75px;
          height: 75px;
          border-radius: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 40px;

          background: linear-gradient(
            135deg,
            #6655ed,
            #a86bff
          );

          box-shadow:
            0 20px 45px
            rgba(102,85,237,.35);
        }


        /* MAIN */

        main {
          max-width: 1100px;
          margin: auto;
          padding: 0 25px 50px;
        }


        /* STATISTICS */

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .stat {
          padding: 22px;

          display: flex;
          align-items: center;
          gap: 17px;

          border: 1px solid #252936;
          border-radius: 18px;

          background: rgba(18,21,31,.9);

          transition: .3s;
        }

        .stat:hover {
          transform: translateY(-5px);
          border-color: #6859df;
        }

        .stat-icon {
          width: 50px;
          height: 50px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: #24213c;
          font-size: 22px;
        }

        .stat p {
          color: #858b9d;
          font-size: 12px;
        }

        .stat h2 {
          margin-top: 5px;
        }


        /* PROGRESS */

        .progress-card {
          margin-top: 18px;
          padding: 25px;

          border: 1px solid #252936;
          border-radius: 18px;

          background: rgba(18,21,31,.9);
        }

        .progress-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-top small {
          color: #858b9d;
          letter-spacing: 1.5px;
        }

        .progress-top h3 {
          margin-top: 6px;
        }

        .progress-top strong {
          color: #9b8cff;
        }

        .bar {
          height: 9px;
          margin-top: 20px;

          border-radius: 20px;
          overflow: hidden;

          background: #252936;
        }

        .fill {
          height: 100%;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #6655e9,
              #b26aff
            );

          transition: width .5s;
        }


        /* ADD TASK */

        .add-card {
          margin-top: 18px;
          padding: 28px;

          border: 1px solid #292d3c;
          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              rgba(30,31,48,.95),
              rgba(15,18,27,.95)
            );
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 15px;

          margin-bottom: 22px;
        }

        .plus-icon {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: #272143;
          color: #a99cff;

          font-size: 25px;
        }

        .section-title h2 {
          font-size: 19px;
        }

        .section-title p {
          color: #858b9d;
          font-size: 12px;
          margin-top: 4px;
        }

        form {
          display: grid;
          grid-template-columns: 1fr 180px 130px;
          gap: 12px;
        }

        input,
        select {
          width: 100%;
          padding: 14px 16px;

          outline: none;

          border: 1px solid #303443;
          border-radius: 12px;

          background: #10131d;
          color: white;
        }

        input:focus,
        select:focus {
          border-color: #7768ed;
        }

        form button {
          border: none;
          border-radius: 12px;

          color: white;
          font-weight: bold;

          background:
            linear-gradient(
              135deg,
              #705ff0,
              #a36bff
            );

          cursor: pointer;
          transition: .3s;
        }

        form button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 10px 25px
            rgba(112,95,240,.3);
        }


        /* SEARCH */

        .search {
          margin-top: 25px;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 0 16px;

          border: 1px solid #272b39;
          border-radius: 13px;

          background: #11141e;
        }

        .search input {
          border: none;
          background: transparent;
        }

        .search button {
          border: none;
          background: transparent;

          color: #858b9d;
          cursor: pointer;
        }


        /* TASKS */

        .task-section {
          margin-top: 30px;
        }

        .task-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;

          margin-bottom: 15px;
        }

        .task-heading small {
          color: #858b9d;
          letter-spacing: 1.5px;
        }

        .task-heading h2 {
          margin-top: 5px;
        }

        .task-count {
          padding: 8px 13px;

          border-radius: 20px;

          background: #211d38;
          color: #a79aff;

          font-size: 12px;
          font-weight: bold;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 15px;

          padding: 18px;

          border: 1px solid #252936;
          border-radius: 16px;

          background: rgba(18,21,31,.9);

          transition: .3s;
        }

        .task-item:hover {
          transform: translateX(5px);
          border-color: #6255c9;
        }

        .check-btn {
          width: 27px;
          height: 27px;

          flex-shrink: 0;

          border: 2px solid #555b70;
          border-radius: 50%;

          background: transparent;
          color: white;

          cursor: pointer;
        }

        .completed .check-btn {
          border-color: #7768ed;
          background: #7768ed;
        }

        .task-content {
          flex: 1;
        }

        .task-content h3 {
          font-size: 15px;
        }

        .completed .task-content h3 {
          color: #707687;
          text-decoration: line-through;
        }

        .priority {
          display: inline-block;

          margin-top: 7px;
          padding: 4px 9px;

          border-radius: 6px;

          font-size: 10px;
          font-weight: bold;
        }

        .priority.high {
          background: #382027;
          color: #ff7c8b;
        }

        .priority.medium {
          background: #332d1d;
          color: #e9c45e;
        }

        .priority.low {
          background: #1e332b;
          color: #70d6a2;
        }

        .delete-btn {
          border: none;
          background: transparent;

          font-size: 17px;
          cursor: pointer;

          opacity: .45;
        }

        .delete-btn:hover {
          opacity: 1;
          transform: scale(1.15);
        }


        /* EMPTY */

        .empty-state {
          margin-top: 25px;
          padding: 60px 20px;

          text-align: center;

          border: 1px dashed #303443;
          border-radius: 18px;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .empty-state p {
          color: #777e91;
          margin-top: 8px;
        }


        /* FOOTER */

        footer {
          text-align: center;

          padding: 30px;

          color: #656b7c;
          font-size: 12px;
        }


        /* RESPONSIVE */

        @media (max-width: 750px) {

          header h1 {
            font-size: 38px;
          }

          .react-logo {
            display: none;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          form {
            grid-template-columns: 1fr;
          }

          form button {
            padding: 14px;
          }
        }

      `}</style>


      <div className="app">

        {/* HEADER */}

        <header>

          <div>
            <p className="label">
              REACT.JS • LAB 3
            </p>

            <h1>
              Task<span>Flow</span>
            </h1>

            <p className="subtitle">
              Organize your tasks. Track your progress.
            </p>
          </div>

          <div className="react-logo">
            ⚛
          </div>

        </header>


        <main>

          {/* STATISTICS */}

          <div className="stats">

            <div className="stat">
              <div className="stat-icon">📋</div>

              <div>
                <p>Total Tasks</p>
                <h2>{totalTasks}</h2>
              </div>
            </div>


            <div className="stat">
              <div className="stat-icon">⏳</div>

              <div>
                <p>Pending</p>
                <h2>{pendingTasks}</h2>
              </div>
            </div>


            <div className="stat">
              <div className="stat-icon">✅</div>

              <div>
                <p>Completed</p>
                <h2>{completedTasks}</h2>
              </div>
            </div>

          </div>


          {/* PROGRESS */}

          <div className="progress-card">

            <div className="progress-top">

              <div>
                <small>YOUR PROGRESS</small>

                <h3>
                  {progress}% Completed
                </h3>
              </div>

              <strong>
                {completedTasks}/{totalTasks}
              </strong>

            </div>

            <div className="bar">

              <div
                className="fill"
                style={{
                  width: `${progress}%`
                }}
              />

            </div>

          </div>


          {/* ADD TASK COMPONENT */}

          <AddTaskForm
            addTask={addTask}
          />


          {/* SEARCH */}

          <div className="search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}

          </div>


          {/* TASK LIST COMPONENT */}

          <TaskList
            tasks={filteredTasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />

        </main>


        <footer>
          Built with React.js • Lab 3 • 2026
        </footer>

      </div>
    </>
  );
}

export default App;