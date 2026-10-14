const input = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const error = document.getElementById("error");

addButton.addEventListener("click", function () {

    const task = input.value.trim();

    // Validation
    if (task === "") {
        error.textContent = "Please enter a task.";
        return;
    }

    error.textContent = "";

    // Create new list item
    const li = document.createElement("li");
    li.textContent = task;

    // Add delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
        li.remove();
    });

    li.appendChild(deleteButton);
    taskList.appendChild(li);

    // Clear input
    input.value = "";
});