const express = require("express");

const app = express();
app.use(express.json());

let students = [];
let nextId = 1;

// POST: Add a student
app.post("/students", (req, res) => {
    const { name, email, age } = req.body;

    if (
        typeof name !== "string" ||
        name.trim() === "" ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !Number.isInteger(age) ||
        age <= 0
    ) {
        return res.status(400).json({ error: "Invalid input" });
    }

    const duplicate = students.some(
        student => student.email.toLowerCase() === email.trim().toLowerCase()
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
    res.status(201).json(student);
});

// GET: All students, with optional minAge
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

        result = students.filter(student => student.age >= minAge);
    }

    res.status(200).json(result);
});

// GET: Student by ID
app.get("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const student = students.find(
        student => student.id === id
    );

    if (!student) {
        return res.status(404).json({
            error: "Student not found"
        });
    }

    res.status(200).json(student);
});

// DELETE: Student by ID
app.delete("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = students.findIndex(
        student => student.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            error: "Student not found"
        });
    }

    students.splice(index, 1);
    res.status(204).end();
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});