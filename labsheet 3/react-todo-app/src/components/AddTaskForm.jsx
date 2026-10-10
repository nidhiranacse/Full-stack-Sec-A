import { useState } from "react";

function AddTaskForm({ onAddTask }) {
    const [task, setTask] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (task.trim() === "") {
            setError("Please enter a task");
            return;
        }

        onAddTask(task.trim());
        setTask("");
        setError("");
    };

    return (
        <div className="add-task-form">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter a new task..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                />
                <button type="submit">Add Task</button>
            </form>

            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default AddTaskForm;