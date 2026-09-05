import TaskItem from "./TaskItem";

function TaskList({ tasks, onDeleteTask }) {
  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ul>
  );
}

export default TaskList;