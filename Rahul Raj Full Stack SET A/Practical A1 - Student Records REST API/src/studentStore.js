/**
 * Student In-Memory Data Store
 * Practical A1: Student Records REST API
 * 
 * Requirements:
 * - In-memory storage for students in insertion order.
 * - IDs start at 1 and increment by 1.
 * - IDs of deleted students are NEVER reused.
 * - Input validation for name, email, and age.
 * - Duplicate email detection (case-insensitive).
 */

class StudentStore {
  constructor() {
    this.students = [];
    this.nextId = 1;
  }

  /**
   * Reset store (useful for clean automated test isolation)
   */
  reset() {
    this.students = [];
    this.nextId = 1;
  }

  /**
   * Validate student payload: { name, email, age }
   */
  validateInput(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return false;
    }

    const { name, email, age } = body;

    // Name must be a non-empty string
    if (typeof name !== 'string' || name.trim().length === 0) {
      return false;
    }

    // Email must be a string and follow valid email format
    if (typeof email !== 'string' || email.trim().length === 0) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return false;
    }

    // Age must be a positive integer number
    if (age === null || age === undefined) {
      return false;
    }
    if (typeof age !== 'number' || isNaN(age) || !Number.isInteger(age) || age <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Check for duplicate email (case-insensitive)
   */
  isDuplicateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const normalized = email.trim().toLowerCase();
    return this.students.some(s => s.email.trim().toLowerCase() === normalized);
  }

  /**
   * Insert a new student with auto-increment ID
   */
  createStudent({ name, email, age }) {
    const student = {
      id: this.nextId++,
      name: name.trim(),
      email: email.trim(),
      age: Number(age)
    };
    this.students.push(student);
    return student;
  }

  /**
   * Fetch all students in insertion order, with optional minAge filter
   */
  getAllStudents(minAge) {
    if (minAge !== undefined && minAge !== null && minAge !== '') {
      const minAgeNum = Number(minAge);
      if (!isNaN(minAgeNum)) {
        return this.students.filter(s => s.age >= minAgeNum);
      }
    }
    return [...this.students];
  }

  /**
   * Retrieve student by ID
   */
  getStudentById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId)) {
      return null;
    }
    const student = this.students.find(s => s.id === numericId);
    return student || null;
  }

  /**
   * Delete student by ID without decrementing or reusing nextId
   */
  deleteStudentById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId)) {
      return false;
    }
    const index = this.students.findIndex(s => s.id === numericId);
    if (index === -1) {
      return false;
    }
    this.students.splice(index, 1);
    // nextId is intentionally NOT decremented so IDs are NEVER reused.
    return true;
  }
}

// Export singleton instance and class definition
const defaultStore = new StudentStore();
defaultStore.StudentStore = StudentStore;
module.exports = defaultStore;
