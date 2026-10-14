/*function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="todo-item">

      <span className={`todo-text ${task.completed ? "completed" : ""}`}>
        {task.text}
      </span>

      <div className="todo-actions">

        <button
          className="complete-btn"
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? "Undo" : "Done"}
        </button>

        <button
          className="delete-btn"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>

      </div>

    </li>
  );
}

export default TaskItem;*/

/*Q4*/
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="todo-item">

      <span
        className={`todo-text ${
          task.completed ? "completed" : ""
        }`}
      >
        {task.text}
      </span>

      <div className="todo-actions">

        <button
          className="complete-btn"
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? "Undo" : "Done"}
        </button>

        <button
          className="delete-btn"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>

      </div>

    </li>
  );
}

export default TaskItem;