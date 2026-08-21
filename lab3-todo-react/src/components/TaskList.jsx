import TaskItem from "./TaskItem";

function TaskList({
  tasks,
  onDeleteTask,
  onToggleTask,
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks available.</p>
        <span>Add your first task above 👆</span>
      </div>
    );
  }

  return (
    <div className="task-list">

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDeleteTask={onDeleteTask}
          onToggleTask={onToggleTask}
        />
      ))}

    </div>
  );
}

export default TaskList;