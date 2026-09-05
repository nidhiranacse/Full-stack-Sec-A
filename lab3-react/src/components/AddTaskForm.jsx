import { useState } from "react";

function AddTaskForm({ onAddTask }) {
  const [task, setTask] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (task.trim() === "") {
      setError("Please enter a task.");
      return;
    }

    onAddTask(task);
    setTask("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        type="text"
        value={task}
        placeholder="Enter a task"
        onChange={(e) => setTask(e.target.value)}
      />
      <button type="submit">Add Task</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default AddTaskForm;