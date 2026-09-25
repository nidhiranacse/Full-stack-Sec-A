function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="task-item">
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />

        <span className={task.completed ? "completed" : ""}>
          {task.text}
        </span>
      </label>

      <button onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </div>
  );
}

export default TaskItem;