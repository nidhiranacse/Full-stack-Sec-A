function TaskItem({
  task,
  onDeleteTask,
  onToggleTask,
}) {
  return (
    <div
      className={`task-item ${
        task.completed ? "completed" : ""
      }`}
    >

      <div className="task-content">

        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
        />

        <span>{task.text}</span>

      </div>

      <button
        className="delete-btn"
        onClick={() => onDeleteTask(task.id)}
      >
        Delete
      </button>

    </div>
  );
}

export default TaskItem;