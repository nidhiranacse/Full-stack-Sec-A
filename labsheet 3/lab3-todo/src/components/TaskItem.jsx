function TaskItem({ task, onToggleTask, onDeleteTask }) {
  return (
    <div className="task-item">
      <span
        className={task.completed ? "completed" : ""}
        onClick={() => onToggleTask(task.id)}
      >
        {task.text}
      </span>

      <button onClick={() => onDeleteTask(task.id)}>
        Delete
      </button>
    </div>
  );
}

export default TaskItem;
