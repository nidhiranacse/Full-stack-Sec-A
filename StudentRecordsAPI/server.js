
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Store student records in memory
let students = [];
let nextId = 1;

// POST /students - Create a student
app.post("/students", (req, res) => {
    const { name, email, age } = req.body;

    // Validate input
    if (
        typeof name !== "string" ||
        name.trim() === "" ||
        typeof email !== "string" ||
        email.trim() === "" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof age !== "number" ||
        !Number.isInteger(age) ||
        age <= 0
    ) {
        return res.status(400).json({
            error: "Invalid input"
        });
    }

    // Check for duplicate email (case-insensitive)
    const duplicate = students.some(
        student =>
            student.email.toLowerCase() === email.trim().toLowerCase()
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
        age
    };

    students.push(student);

    return res.status(201).json(student);
});

// GET /students - List all students
// Optional query: /students?minAge=18
app.get("/students", (req, res) => {
    let result = students;

    if (req.query.minAge !== undefined) {
        const minAge = req.query.minAge;

        if (minAge.trim() === "" || !Number.isFinite(Number(minAge))) {
            return res.status(400).json({
                error: "Invalid input"
            });
        }

        result = students.filter(
            student => student.age >= Number(minAge)
        );
    }

    return res.status(200).json(result);
});

// GET /students/:id - Fetch one student
app.get("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            error: "Student not found"
        });
    }

    const student = students.find(s => s.id === id);

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
    const index = students.findIndex(s => s.id === id);

    if (!Number.isInteger(id) || id <= 0 || index === -1) {
        return res.status(404).json({
            error: "Student not found"
        });
    }

    students.splice(index, 1);

    // 204 responses must have an empty body
    return res.status(204).end();
});

// Start server
app.listen(PORT, () => {
    console.log(`Student Records API running at http://localhost:${PORT}`);
});
