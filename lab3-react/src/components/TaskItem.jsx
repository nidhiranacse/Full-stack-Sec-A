function TaskItem({ task, onDeleteTask }) {
  return (
    <li className="task-item">
      <span>{task.text}</span>
      <button onClick={() => onDeleteTask(task.id)}>
        Delete
      </button>
    </li>
  );
}

export default TaskItem;