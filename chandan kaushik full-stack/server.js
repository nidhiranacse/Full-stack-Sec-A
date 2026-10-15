
const express = require("express");

const app = express();
app.use(express.json());

let students = [];
let nextId = 1;

// Validate student input
function isValidStudent({ name, email, age }) {
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    Number.isInteger(age) &&
    age >= 1 &&
    age <= 120
  );
}

// POST /students - Create a student
app.post("/students", (req, res) => {
  const { name, email, age } = req.body ?? {};

  if (!isValidStudent({ name, email, age })) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const exists = students.some(
    (student) => student.email.toLowerCase() === normalizedEmail
  );

  if (exists) {
    return res.status(409).json({
      error: "Email already exists"
    });
  }

  const student = {
    id: nextId++,
    name: name.trim(),
    email: email.trim(),
    age
  };

  students.push(student);
  return res.status(201).json(student);
});

// GET /students - List all students
app.get("/students", (req, res) => {
  let result = students;

  if (req.query.minAge !== undefined) {
    const minAge = Number(req.query.minAge);

    if (
      req.query.minAge.trim() === "" ||
      !Number.isInteger(minAge) ||
      minAge < 0
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    result = students.filter(
      (student) => student.age >= minAge
    );
  }

  return res.status(200).json(result);
});

// GET /students/:id - Fetch a student
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

// DELETE /students/:id - Delete a student
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
  return res.status(204).end();
});

// Handle invalid JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: "Invalid input" });
  }

  next(err);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
