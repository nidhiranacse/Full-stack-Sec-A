import { useState } from "react";

function AddTaskForm({ onAddTask }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = text.trim();

    if (!value) {
      setError("Please enter a task.");
      return;
    }

    onAddTask(value);
    setText("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <div className="input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a task"
        />

        <button type="submit">Add</button>
      </div>

      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default AddTaskForm;