import TaskItem from "./TaskItem";

function TaskList({ tasks, onToggleTask, onDeleteTask }) {
  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <p>No tasks available.</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        ))
      )}
    </div>
  );
}

export default TaskList;
