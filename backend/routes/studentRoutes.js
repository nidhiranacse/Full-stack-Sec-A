const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// CREATE - Add a new student
router.post("/", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// READ - Get all students
router.get("/", async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Get one student by ID
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE - Update a student
router.put("/:id", async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        await student.update(req.body);
        res.json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Delete a student
router.delete("/:id", async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        await student.destroy();
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;