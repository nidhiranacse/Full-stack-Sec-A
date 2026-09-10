import { useState } from "react";

function AddTaskForm({ onAddTask }) {

    const [task, setTask] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event) => {

        event.preventDefault();

        if (task.trim() === "") {
            setError("Please enter a task.");
            return;
        }

        setError("");

        onAddTask(task.trim());

        setTask("");
    };

    return (
        <div className="form-container">

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    value={task}
                    onChange={(event) => setTask(event.target.value)}
                    placeholder="Enter a task..."
                />

                <button type="submit">
                    Add Task
                </button>

            </form>

            {error && <p className="error">{error}</p>}

        </div>
    );
}

export default AddTaskForm;