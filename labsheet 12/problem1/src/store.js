// ─── In-Memory Data Store ────────────────────────────────────────────
// Shared across the app — users, tasks, and rate-limit tracking.

const users = new Map();        // email -> { id, email, passwordHash, role }
const tasks = new Map();        // taskId -> { id, title, status, ownerId }
const loginAttempts = new Map(); // email -> [{ timestamp }, ...]

let nextUserId = 1;
let nextTaskId = 1;

function generateUserId() {
  return nextUserId++;
}

function generateTaskId() {
  return nextTaskId++;
}

module.exports = {
  users,
  tasks,
  loginAttempts,
  generateUserId,
  generateTaskId,
};
