// ========================================
// SELECT HTML ELEMENTS
// ========================================

// Get the input field
const taskInput = document.getElementById("taskInput");

// Get the Add button
const addButton = document.getElementById("addButton");

// Get the task list
const taskList = document.getElementById("taskList");

// Get the empty message
const emptyMessage = document.getElementById("emptyMessage");


// ========================================
// ADD TASK FUNCTION
// ========================================

function addTask() {

    // Get the text entered by the user
    const taskText = taskInput.value.trim();


    // Don't add an empty task
    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }


    // ====================================
    // CREATE TASK ELEMENT
    // ====================================

    // Create a new <li>
    const taskItem = document.createElement("li");

    // Add CSS class to the <li>
    taskItem.classList.add("task-item");


    // ====================================
    // CREATE TASK TEXT
    // ====================================

    // Create a <span> for task text
    const task = document.createElement("span");

    // Add CSS class
    task.classList.add("task-text");

    // Put user's text inside span
    task.textContent = taskText;


    // ====================================
    // MARK TASK AS COMPLETE
    // ====================================

    task.addEventListener("click", function () {

        // Add/remove completed class
        task.classList.toggle("completed");

    });


    // ====================================
    // CREATE DELETE BUTTON
    // ====================================

    // Create button
    const deleteButton = document.createElement("button");

    // Add CSS class
    deleteButton.classList.add("delete-button");

    // Button text
    deleteButton.textContent = "Delete";


    // ====================================
    // DELETE TASK
    // ====================================

    deleteButton.addEventListener("click", function () {

        // Remove task from the list
        taskItem.remove();

        // Check if list is empty
        updateEmptyMessage();

    });


    // ====================================
    // ADD ELEMENTS TO DOM
    // ====================================

    // Add task text inside li
    taskItem.appendChild(task);

    // Add delete button inside li
    taskItem.appendChild(deleteButton);

    // Add complete task to the task list
    taskList.appendChild(taskItem);


    // Clear input field
    taskInput.value = "";

    // Put cursor back inside input
    taskInput.focus();


    // Hide empty message
    updateEmptyMessage();
}


// ========================================
// UPDATE EMPTY MESSAGE
// ========================================

function updateEmptyMessage() {

    // Check how many tasks exist
    if (taskList.children.length === 0) {

        // Show message
        emptyMessage.style.display = "block";

    } else {

        // Hide message
        emptyMessage.style.display = "none";
    }
}


// ========================================
// ADD BUTTON EVENT
// ========================================

addButton.addEventListener("click", addTask);


// ========================================
// ENTER KEY SUPPORT
// ========================================

taskInput.addEventListener("keydown", function (event) {

    // If user presses Enter
    if (event.key === "Enter") {

        // Add the task
        addTask();
    }

});