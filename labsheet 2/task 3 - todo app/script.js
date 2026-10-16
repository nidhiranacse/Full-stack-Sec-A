const form = document.querySelector("#todoForm");
const input = document.querySelector("#todoInput");
const list = document.querySelector("#todoList");
const errorMessage = document.querySelector("#errorMessage");
const emptyMessage = document.querySelector("#emptyMessage");
const taskCount = document.querySelector("#taskCount");

let tasks = [];

function renderTasks() {
  list.replaceChildren();

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `todo-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as complete`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      renderTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyMessage.hidden = tasks.length > 0;
  taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    errorMessage.textContent = "Please enter a task before adding it.";
    input.focus();
    return;
  }

  tasks.push({ id: Date.now(), text, completed: false });
  input.value = "";
  errorMessage.textContent = "";
  renderTasks();
  input.focus();
});
