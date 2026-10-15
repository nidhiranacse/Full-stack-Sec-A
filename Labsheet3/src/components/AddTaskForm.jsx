import { useState } from "react";

function AddTaskForm({ addTask }) {
  const [taskText, setTaskText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (taskText.trim() === "") {
      return;
    }

    addTask(taskText);
    setTaskText("");
  };

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input
        type="text"
        placeholder="Enter a task"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
      />

      <button type="submit">Add Task</button>
    </form>
  );
}

export default AddTaskForm;