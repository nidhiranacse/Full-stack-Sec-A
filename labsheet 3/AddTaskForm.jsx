import { useState } from "react";
function AddTaskForm({ addTask }) {
    const [task,setTask] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (task.trim() === ""){
            return;
        }
        addTask(task);
        setTask("");
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

        </form>
    );
}
export default AddTaskForm;