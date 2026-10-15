
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

let students = [];
let nextId = 1;

// Check student input
function isValidStudent(name, email, age) {
  const validName =
    typeof name === "string" && name.trim().length > 0;

  const validEmail =
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validAge =
    Number.isInteger(age) && age > 0;

  return validName && validEmail && validAge;
}

// Create a student
app.post("/students", (req, res) => {
  const { name, email, age } = req.body;

  if (!isValidStudent(name, email, age)) {
    return res.status(400).json({
      error: "Invalid input"
    });
  }

  const emailExists = students.some(
    (student) =>
      student.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (emailExists) {
    return res.status(409).json({
      error: "Email already exists"
    });
  }

  const student = {
    id: nextId++,
    name: name.trim(),
    email: email.trim(),
    age: age
  };

  students.push(student);

  return res.status(201).json(student);
});

// List all students, with optional minimum age
app.get("/students", (req, res) => {
  const { minAge } = req.query;

  if (minAge !== undefined) {
    const ageLimit = Number(minAge);

    if (minAge.trim() === "" ||
        !Number.isFinite(ageLimit) ||
        ageLimit < 0) {
      return res.status(400).json({
        error: "Invalid input"
      });
    }

    const filteredStudents = students.filter(
      (student) => student.age >= ageLimit
    );

    return res.status(200).json(filteredStudents);
  }

  return res.status(200).json(students);
});

// Get one student by ID
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);

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

// Delete a student
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = students.findIndex(
    (student) => student.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Student not found"
    });
  }

  students.splice(index, 1);

  return res.status(204).send();
});

// Handle malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: "Invalid input"
    });
  }

  return res.status(500).json({
    error: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Student API running at http://localhost:${PORT}`);
});
