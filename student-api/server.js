
const express = require('express');
const app = express();

app.use(express.json());

let students = [];
let nextId = 1;

// Add student
app.post('/students', (req, res) => {
    const { name, email, age } = req.body;

    if (typeof name !== 'string' || !name.trim() ||
        typeof email !== 'string' || !email.trim() ||
        age === undefined || age === null ||
        age === '' || !Number.isFinite(Number(age)) ||
        !Number.isInteger(Number(age)) || Number(age) < 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    if (students.some(s => s.email === email.trim())) {
        return res.status(409).json({
            error: 'Email already exists'
        });
    }

    const student = {
        id: nextId++,
        name: name.trim(),
        email: email.trim(),
        age: Number(age)
    };

    students.push(student);
    res.status(201).json(student);
});

// List students and filter by minimum age
app.get('/students', (req, res) => {
    let result = students;

    if (req.query.minAge !== undefined) {
        const minAge = Number(req.query.minAge);

        if (req.query.minAge.trim() === '' ||
            !Number.isFinite(minAge)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        result = students.filter(s => s.age >= minAge);
    }

    res.status(200).json(result);
});

// Get student by ID
app.get('/students/:id', (req, res) => {
    const student = students.find(
        s => s.id === Number(req.params.id)
    );

    if (!student) {
        return res.status(404).json({
            error: 'Student not found'
        });
    }

    res.status(200).json(student);
});

// Delete student
app.delete('/students/:id', (req, res) => {
    const index = students.findIndex(
        s => s.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            error: 'Student not found'
        });
    }

    students.splice(index, 1);
    res.status(204).send();
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
