/**
 * In-Memory Data Store for Secure Task Manager API
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 */

class InMemoryStore {
  constructor() {
    this.users = new Map(); // id -> user object
    this.usersByEmail = new Map(); // normalized email -> user object
    this.tasks = new Map(); // id -> task object
    this.loginAttempts = new Map(); // normalized email -> Array of timestamps
    this.nextUserId = 1;
    this.nextTaskId = 1;
  }

  // Reset store (useful for automated testing)
  reset() {
    this.users.clear();
    this.usersByEmail.clear();
    this.tasks.clear();
    this.loginAttempts.clear();
    this.nextUserId = 1;
    this.nextTaskId = 1;
  }

  // User operations
  createUser({ email, password, role = 'user' }) {
    const normalizedEmail = email.trim().toLowerCase();
    const id = this.nextUserId++;
    const user = {
      id,
      email: normalizedEmail,
      password, // hashed
      role,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    this.usersByEmail.set(normalizedEmail, user);
    return user;
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.usersByEmail.get(email.trim().toLowerCase()) || null;
  }

  findUserById(id) {
    const numericId = Number(id);
    return this.users.get(numericId) || null;
  }

  // Login attempt tracking (Rate limit: 5 failed attempts per minute)
  getRecentFailedAttempts(email, now = Date.now()) {
    const normalizedEmail = email.trim().toLowerCase();
    const attempts = this.loginAttempts.get(normalizedEmail) || [];
    // Filter attempts within the 60-second window
    const validAttempts = attempts.filter(ts => (now - ts) < 60000);
    this.loginAttempts.set(normalizedEmail, validAttempts);
    return validAttempts;
  }

  recordFailedAttempt(email, timestamp = Date.now()) {
    const normalizedEmail = email.trim().toLowerCase();
    const attempts = this.getRecentFailedAttempts(email, timestamp);
    attempts.push(timestamp);
    this.loginAttempts.set(normalizedEmail, attempts);
  }

  clearFailedAttempts(email) {
    const normalizedEmail = email.trim().toLowerCase();
    this.loginAttempts.delete(normalizedEmail);
  }

  // Task operations
  createTask({ title, status, userId }) {
    const id = this.nextTaskId++;
    const task = {
      id,
      title: title.trim(),
      status,
      userId: Number(userId),
      createdAt: new Date().toISOString()
    };
    this.tasks.set(id, task);
    return task;
  }

  findTaskById(id) {
    const numericId = Number(id);
    return this.tasks.get(numericId) || null;
  }

  getUserTasks(userId, { status, page = 1, limit = 10 } = {}) {
    const numericUserId = Number(userId);
    let userTasks = Array.from(this.tasks.values()).filter(t => t.userId === numericUserId);

    if (status) {
      userTasks = userTasks.filter(t => t.status === status);
    }

    // Sort by id descending or createdAt
    userTasks.sort((a, b) => b.id - a.id);

    const total = userTasks.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = userTasks.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      page,
      total
    };
  }

  updateTask(id, updates) {
    const task = this.findTaskById(id);
    if (!task) return null;

    if (updates.title !== undefined) {
      task.title = updates.title.trim();
    }
    if (updates.status !== undefined) {
      task.status = updates.status;
    }
    task.updatedAt = new Date().toISOString();
    return task;
  }

  deleteTask(id) {
    const numericId = Number(id);
    return this.tasks.delete(numericId);
  }
}

const store = new InMemoryStore();
module.exports = store;
