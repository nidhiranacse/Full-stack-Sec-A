
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware: read JSON request bodies
app.use(express.json());

// In-memory storage
let students = [];
let nextId = 1;

// Validate student input
function isValidStudent(name, email, age) {
  if (typeof name !== "string" || name.trim() === "") {
    return false;
  }

  if (typeof email !== "string") {
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return false;
  }

  if (
    age === undefined ||
    age === null ||
    (typeof age !== "number") ||
    !Number.isInteger(age) ||
    age <= 0
  ) {
    return false;
  }

  return true;
}

// POST /students - Create a student
app.post("/students", (req, res) => {
  const { name, email, age } = req.body;

  // Validate input
  if (!isValidStudent(name, email, age)) {
    return res.status(400).json({
      error: "Invalid input"
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();

  // Check for duplicate email (case-insensitive)
  const emailExists = students.some(
    (student) =>
      student.email.toLowerCase() === cleanEmail.toLowerCase()
  );

  if (emailExists) {
    return res.status(409).json({
      error: "Email already exists"
    });
  }

  // Create student
  const student = {
    id: nextId++,
    name: cleanName,
    email: cleanEmail,
    age: age
  };

  students.push(student);

  return res.status(201).json(student);
});

// GET /students - List all students or filter by minAge
app.get("/students", (req, res) => {
  let result = students;

  if (req.query.minAge !== undefined) {
    const minAge = Number(req.query.minAge);

    if (
      req.query.minAge.trim() === "" ||
      !Number.isFinite(minAge)
    ) {
      return res.status(400).json({
        error: "Invalid minAge"
      });
    }

    result = students.filter(
      (student) => student.age >= minAge
    );
  }

  return res.status(200).json(result);
});

// GET /students/:id - Fetch a student by ID
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (
    !/^[1-9]\d*$/.test(req.params.id) ||
    !Number.isSafeInteger(id)
  ) {
    return res.status(404).json({
      error: "Student not found"
    });
  }

  const student = students.find(
    (student) => student.id === id
  );

  if (!student) {
    return res.status(404).json({
      error: "Student not found"
    });
  }

  return res.status(200).json(student);
});

// DELETE /students/:id - Delete a student
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (
    !/^[1-9]\d*$/.test(req.params.id) ||
    !Number.isSafeInteger(id)
  ) {
    return res.status(404).json({
      error: "Student not found"
    });
  }

  const index = students.findIndex(
    (student) => student.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Student not found"
    });
  }

  students.splice(index, 1);

  // 204 means success with no response body
  return res.status(204).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
