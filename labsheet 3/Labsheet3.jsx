import { useEffect, useState } from "react";

function AddTaskForm({ onAdd }) {
  const [task, setTask] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (task.trim() === "") return;

    onAdd(task);
    setTask("");
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter a new task..."
        style={styles.input}
      />

      <button type="submit" style={styles.addButton}>
        + Add Task
      </button>
    </form>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div style={styles.taskItem}>
      <div
        onClick={() => onToggle(task.id)}
        style={{
          ...styles.taskText,
          textDecoration: task.completed ? "line-through" : "none",
          color: task.completed ? "#999" : "#222",
        }}
      >
        {task.completed ? "✅" : "⭕"} {task.title}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        style={styles.deleteButton}
      >
        Delete
      </button>
    </div>
  );
}

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div style={styles.empty}>
        🎉 No tasks yet. Add your first task!
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("reactTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("reactTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title) => {
    const newTask = {
      id: Date.now(),
      title: title,
      completed: false,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const toggleTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== id)
    );
  };

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  const progress =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>✓</div>

          <div>
            <h1 style={styles.title}>TaskFlow</h1>
            <p style={styles.subtitle}>
              React To-Do Application
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div style={styles.stats}>
          <div style={styles.statBox}>
            <strong>{tasks.length}</strong>
            <span>Total Tasks</span>
          </div>

          <div style={styles.statBox}>
            <strong>{completedCount}</strong>
            <span>Completed</span>
          </div>

          <div style={styles.statBox}>
            <strong>{pendingCount}</strong>
            <span>Pending</span>
          </div>
        </div>

        {/* Progress */}
        <div style={styles.progressCard}>
          <div style={styles.progressTop}>
            <div>
              <h3 style={styles.progressTitle}>
                🔥 Your Progress
              </h3>

              <p style={styles.progressText}>
                {completedCount} of {tasks.length} tasks completed
              </p>
            </div>

            <strong style={styles.progressPercent}>
              {progress}%
            </strong>
          </div>

          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Add Task */}
        <AddTaskForm onAdd={addTask} />

        {/* Task List */}
        <h2 style={styles.heading}>My Tasks</h2>

        <TaskList
          tasks={tasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />

        {/* Footer */}
        <div style={styles.footer}>
          Built with React • useState • useEffect • Props
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #667eea, #764ba2)",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "750px",
    margin: "auto",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },

  logo: {
    width: "55px",
    height: "55px",
    borderRadius: "15px",
    background: "#667eea",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "bold",
  },

  title: {
    margin: 0,
    color: "#222",
    fontSize: "32px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#777",
  },

  stats: {
    display: "flex",
    justifyContent: "space-between",
    background: "#f5f6ff",
    padding: "18px",
    borderRadius: "16px",
    marginBottom: "20px",
  },

  statBox: {
    flex: 1,
    textAlign: "center",
  },

  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
  },

  input: {
    flex: 1,
    padding: "14px",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    fontSize: "16px",
    outline: "none",
  },

  addButton: {
    border: "none",
    background: "#667eea",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  progressCard: {
    background: "#f5f6ff",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "25px",
  },

  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  progressTitle: {
    margin: 0,
    color: "#333",
  },

  progressText: {
    margin: "5px 0",
    color: "#777",
  },

  progressPercent: {
    fontSize: "25px",
    color: "#667eea",
  },

  progressBar: {
    height: "12px",
    background: "#ddd",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#667eea",
    borderRadius: "20px",
    transition: "width 0.4s ease",
  },

  heading: {
    color: "#333",
    marginBottom: "15px",
  },

  taskItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "14px",
    background: "#f8f8fb",
    border: "1px solid #eee",
  },

  taskText: {
    fontSize: "17px",
    cursor: "pointer",
    flex: 1,
  },

  deleteButton: {
    border: "none",
    background: "#ff5c5c",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#777",
    background: "#f8f8fb",
    borderRadius: "14px",
  },

  footer: {
    textAlign: "center",
    marginTop: "25px",
    color: "#999",
    fontSize: "13px",
  },
};

export default App;