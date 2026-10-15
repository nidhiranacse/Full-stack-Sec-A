import TaskItem from "./TaskItem";

function TaskList({ tasks, deleteTask, toggleTask }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-message">
        <div className="empty-icon">🌸</div>
        <p>No tasks yet!</p>
        <span>Add something you need to do.</span>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
        />
      ))}
    </div>
  );
}

export default TaskList;