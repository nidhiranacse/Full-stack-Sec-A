import { useState } from "react";

function AddTaskForm({ onAddTask }) {
  const [task, setTask] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTask = task.trim();

    if (trimmedTask === "") {
      setError("Please enter a task.");
      return;
    }

    onAddTask(trimmedTask);
    setTask("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="Enter a task..."
        />

        <button type="submit">
          Add Task
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
}

export default AddTaskForm;