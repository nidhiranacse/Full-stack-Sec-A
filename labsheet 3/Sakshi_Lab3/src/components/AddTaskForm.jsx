import { useState } from "react";

function AddTaskForm({ addTask }) {
  const [taskText, setTaskText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (taskText.trim() === "") {
      return;
    }

    addTask(taskText.trim());
    setTaskText("");
  };

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What do you need to do?"
        value={taskText}
        onChange={(event) => setTaskText(event.target.value)}
      />

      <button type="submit">
        + Add Task
      </button>
    </form>
  );
}

export default AddTaskForm;