const taskInput=document.getElementById("taskInput");
const addBtn=document.getElementById("addBtn");
const todoList=document.getElementById("todoList");
const errorMessage=document.getElementById("errorMessage");

addBtn.addEventListener("click",function(){
    const taskText=taskInput.value.trim();
    if(taskInput=== ""){
        errorMessage.textContent="Please enter a task!";
        return;
    }
    errorMessage.textContent="";
    const li=document.createElement("li");
    const span = document.createElement("span");
    span.textContent = taskText;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    span.addEventListener("click", function() {
        span.classList.toggle("completed");
    });
    deleteBtn.addEventListener("click", function() {
        li.remove();
    });
    li.appendChild(span);
    li.appendChild(deleteBtn);

    todoList.appendChild(li);
    taskInput.value = "";
});