function TaskItem({ task, deleteTask, toggleTask }) {
  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
        />

        <span>{task.text}</span>
      </div>

      <button
        className="delete-btn"
        onClick={() => deleteTask(task.id)}
        title="Delete task"
      >
        🗑️
      </button>
    </div>
  );
}

export default TaskItem;