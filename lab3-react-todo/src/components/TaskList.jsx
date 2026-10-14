/*import TaskItem from "./TaskItem";

function TaskList({ tasks, onToggle, onDelete }) {
  return (
    <ul id="todoList">

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}

    </ul>
  );
}

export default TaskList;*/

/*q4*/
import TaskItem from "./TaskItem";

function TaskList({ tasks, onToggle, onDelete }) {
  return (
    <ul id="todoList">

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}

    </ul>
  );
}

export default TaskList;