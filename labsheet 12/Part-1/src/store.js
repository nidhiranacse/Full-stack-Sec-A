// ──────────────────────────────────────────────────────────────
// In-Memory Data Store  –  users & tasks stored in Maps
// ──────────────────────────────────────────────────────────────

const users = new Map();   // key: id   → { id, name, email, password, role }
const tasks = new Map();   // key: id   → { id, title, status, userId, createdAt, updatedAt }

// Secondary index for fast email look-ups
const emailIndex = new Map(); // key: email → userId

module.exports = { users, tasks, emailIndex };
