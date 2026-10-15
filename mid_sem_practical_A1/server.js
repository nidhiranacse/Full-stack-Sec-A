
const express = require("express");

const app = express();
app.use(express.json());

let students = [];
let nextId = 1;

function isValidStudent(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return false;
    }

    const { name, email, age } = body;

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

app.post("/students", (req, res) => {
    if (!isValidStudent(req.body)) {
        return res.status(400).json({
            error: "Invalid input"
        });
    }

    const { name, email, age } = req.body;

    const existingStudent = students.find(
        student => student.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingStudent) {
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

app.get("/students", (req, res) => {
    let result = students;

    if (req.query.minAge !== undefined) {
        const minAge = req.query.minAge;

        if (minAge.trim() === "" || !/^\d+$/.test(minAge)) {
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

    return res.status(200).json(student);
});


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

    return res.status(204).send();
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
