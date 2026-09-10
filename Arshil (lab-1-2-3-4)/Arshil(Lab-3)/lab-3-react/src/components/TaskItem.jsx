function TaskItem({task,toggleTask,deleteTask}){
 return(
  <div className="task">
   <input type="checkbox" checked={task.done} onChange={()=>toggleTask(task.id)}/>
   <span className={task.done?"done":""}>{task.text}</span>
   <button onClick={()=>deleteTask(task.id)}>Delete</button>
  </div>
 );
}

export default TaskItem;