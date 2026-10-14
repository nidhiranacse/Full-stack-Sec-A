/*const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }
});*/

/*Q3*/
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const errorMessage = document.getElementById("errorMessage");
const taskCount = document.getElementById("taskCount");
const clearAll = document.getElementById("clearAll");

todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = todoInput.value.trim();

    if (taskText === "") {
        errorMessage.textContent = "Please enter a task.";
        todoInput.focus();
        return;
    }

    errorMessage.textContent = "";

    addTask(taskText);

    todoInput.value = "";
    todoInput.focus();

    updateTaskCount();
});

function addTask(taskText) {
    const listItem = document.createElement("li");
    listItem.className = "todo-item";

    const taskSpan = document.createElement("span");
    taskSpan.className = "todo-text";
    taskSpan.textContent = taskText;

    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const completeButton = document.createElement("button");
    completeButton.className = "complete-btn";
    completeButton.textContent = "Done";
    completeButton.type = "button";

    completeButton.addEventListener("click", function () {
        taskSpan.classList.toggle("completed");
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", function () {
        listItem.remove();
        updateTaskCount();
    });

    actions.appendChild(completeButton);
    actions.appendChild(deleteButton);

    listItem.appendChild(taskSpan);
    listItem.appendChild(actions);

    todoList.appendChild(listItem);
}

function updateTaskCount() {
    const count = todoList.children.length;

    if (count === 0) {
        taskCount.textContent = "0 tasks";
    } else if (count === 1) {
        taskCount.textContent = "1 task";
    } else {
        taskCount.textContent = count + " tasks";
    }
}

clearAll.addEventListener("click", function () {
    todoList.innerHTML = "";
    updateTaskCount();
    errorMessage.textContent = "";
});