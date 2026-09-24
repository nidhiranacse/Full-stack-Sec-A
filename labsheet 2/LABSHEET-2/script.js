// Task 2.1 - Dark Mode

const themeButton = document.getElementById("themeButton");

if (themeButton) {
    themeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });
}

function showMessage() {
    const message = document.getElementById("message");

    if (message) {
        message.textContent = "Welcome! You are ready to get started.";
    }
}


// Task 2.3 - Todo Application

const addButton = document.getElementById("addButton");

if (addButton) {
    addButton.addEventListener("click", addTask);
}

function addTask() {
    const input = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const errorMessage = document.getElementById("errorMessage");

    const task = input.value.trim();

    if (task === "") {
        errorMessage.textContent = "Please enter a task.";
        return;
    }

    errorMessage.textContent = "";

    const listItem = document.createElement("li");

    listItem.textContent = task;

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", function () {
        listItem.remove();
    });

    listItem.appendChild(deleteButton);
    taskList.appendChild(listItem);

    input.value = "";
}