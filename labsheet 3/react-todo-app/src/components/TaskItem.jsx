function TaskItem({ task, onToggle, onDelete, onEdit }) {
    const handleEdit = () => {
        const newText = prompt("Edit your task:", task.text);

        if (newText !== null && newText.trim() !== "") {
            onEdit(task.id, newText.trim());
        }
    };

    return (
        <div className={`task-item ${task.completed ? "completed" : ""}`}>
            <div className="task-content">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task.id)}
                />
                <span>{task.text}</span>
            </div>

            <div className="task-actions">
                <button onClick={handleEdit}>Edit</button>
                <button onClick={() => onDelete(task.id)}>Delete</button>
            </div>
        </div>
    );
}

export default TaskItem;