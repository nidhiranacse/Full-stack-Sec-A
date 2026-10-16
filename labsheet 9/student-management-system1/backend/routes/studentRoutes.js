const express = require("express");
const router = express.Router();

const Student = require("../models/Student");

// POST - Add Student
router.post("/", async (req, res) => {
    try {
        const { name, rollNo, course, marks } = req.body;

        const student = new Student({
            name,
            rollNo,
            course,
            marks
        });

        const savedStudent = await student.save();

        res.status(201).json({
            message: "Student added successfully",
            student: savedStudent
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to add student",
            error: error.message
        });
    }
});

// GET - View All Students
router.get("/", async (req, res) => {
    try {
        const students =
            await Student.find()
            .sort({ createdAt: -1 });

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch students",
            error: error.message
        });
    }
});

// GET - View Student by ID
router.get("/:id", async (req, res) => {
    try {
        const student =
            await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);

    } catch (error) {
        res.status(400).json({
            message: "Invalid student ID",
            error: error.message
        });
    }
});

// PUT - Update Student
router.put("/:id", async (req, res) => {
    try {
        const { name, rollNo, course, marks } = req.body;

        const updatedStudent =
            await Student.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    rollNo,
                    course,
                    marks
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedStudent) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully",
            student: updatedStudent
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update student",
            error: error.message
        });
    }
});

// DELETE - Delete Student
router.delete("/:id", async (req, res) => {
    try {
        const deletedStudent =
            await Student.findByIdAndDelete(
                req.params.id
            );

        if (!deletedStudent) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully",
            student: deletedStudent
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid student ID",
            error: error.message
        });
    }
});

module.exports = router;