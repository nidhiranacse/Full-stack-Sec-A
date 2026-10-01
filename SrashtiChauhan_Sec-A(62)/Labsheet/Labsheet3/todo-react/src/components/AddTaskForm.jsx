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

        onAddTask(task.trim());

        setTask("");
        setError("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Enter a task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
            />

            <button type="submit">Add Task</button>

            {error && <p className="error">{error}</p>}
        </form>
    );
}

export default AddTaskForm;