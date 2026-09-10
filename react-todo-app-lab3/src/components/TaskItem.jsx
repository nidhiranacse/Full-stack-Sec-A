function TaskItem({ task, onDelete, onToggle }) {

    return (
        <div className="task-item">

            <span
                className={task.completed ? "completed" : ""}
                onClick={() => onToggle(task.id)}
            >
                {task.text}
            </span>

            <button
                className="delete-btn"
                onClick={() => onDelete(task.id)}
            >
                Delete
            </button>

        </div>
    );
}

export default TaskItem;