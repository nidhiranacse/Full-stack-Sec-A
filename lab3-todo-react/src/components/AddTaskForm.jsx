import { useState } from "react";

function AddTaskForm({ onAddTask }) {
  const [task, setTask] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (task.trim() === "") {
      return;
    }

    onAddTask(task);

    setTask("");
  };

  return (
    <form
      className="add-task-form"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Enter a new task..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />

      <button type="submit">
        Add Task
      </button>
    </form>
  );
}

export default AddTaskForm;