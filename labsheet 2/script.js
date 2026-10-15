const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const errorMessage = document.getElementById("errorMessage");

addBtn.addEventListener("click", addTodo);

function addTodo() {

    const task = todoInput.value.trim();

    if (task === "") {

        errorMessage.textContent = "Please enter a task!";

        return;
    }

    errorMessage.textContent = "";

    const li = document.createElement("li");

    li.classList.add("todo-item");

    const span = document.createElement("span");

    span.textContent = task;

    span.addEventListener("click", function () {

        span.classList.toggle("complete");

    });

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete";

    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function () {

        li.remove();

    });

    li.appendChild(span);

    li.appendChild(deleteBtn);

    todoList.appendChild(li);
    todoInput.value = "";
}