const users = [];
const tasks = [];

let nextUserId = 1;
let nextTaskId = 1;

function createUserId() {
  return String(nextUserId++);
}

function createTaskId() {
  return String(nextTaskId++);
}

module.exports = {
  users,
  tasks,
  createUserId,
  createTaskId,
};