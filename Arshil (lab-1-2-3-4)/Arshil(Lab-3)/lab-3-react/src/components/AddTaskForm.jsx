import {useState} from "react";

function AddTaskForm({addTask}){
 const [text,setText]=useState("");
 const submit=e=>{
  e.preventDefault();
  if(!text.trim())return;
  addTask(text.trim());
  setText("");
 };
 return(
  <form onSubmit={submit} className="form">
   <input value={text} onChange={e=>setText(e.target.value)} placeholder="Enter task"/>
   <button>Add Task</button>
  </form>
 );
}

export default AddTaskForm;