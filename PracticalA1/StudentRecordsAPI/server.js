

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Store students in memory
let students = [];
let nextId = 1;

// Validate student input
function isValidStudent(name, email, age) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
        typeof name === "string" &&
        name.trim() !== "" &&
        typeof email === "string" &&
        emailPattern.test(email.trim()) &&
        typeof age === "number" &&
        Number.isInteger(age) &&
        age > 0
    );
}

// POST /students - Add a student
app.post("/students", (req, res) => {
    const { name, email, age } = req.body || {};

    if (!isValidStudent(name, email, age)) {
        return res.status(400).json({
            error: "Invalid input"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const duplicate = students.some(
        student => student.email.toLowerCase() === normalizedEmail
    );

    if (duplicate) {
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

// GET /students - List all students
// Optional query: ?minAge=18
app.get("/students", (req, res) => {
    let result = students;

    if (req.query.minAge !== undefined) {
        const minAge = Number(req.query.minAge);

        if (req.query.minAge.trim() === "" ||
            !Number.isFinite(minAge)) {
            return res.status(400).json({
                error: "Invalid input"
            });
        }

        result = students.filter(
            student => student.age >= minAge
        );
    }

    return res.status(200).json(result);
});

// GET /students/:id - Get one student
app.get("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const student = students.find(
        student => student.id === id
    );

    if (!Number.isInteger(id) || id < 1 || !student) {
        return res.status(404).json({
            error: "Student not found"
        });
    }

    return res.status(200).json(student);
});

// DELETE /students/:id - Delete one student
app.delete("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = students.findIndex(
        student => student.id === id
    );

    if (!Number.isInteger(id) || id < 1 || index === -1) {
        return res.status(404).json({
            error: "Student not found"
        });
    }

    students.splice(index, 1);

    return res.status(204).send();
});
app.get("/", (req, res) => {
    res.send("Student Records API is running");
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
