const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// CREATE STUDENT
router.post("/", async (req, res) => {
    try {
        const { name, rollNo, course, marks } = req.body;

        if (!name || !rollNo || !course || marks === undefined) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (Number(marks) < 0 || Number(marks) > 100) {
            return res.status(400).json({
                message: "Marks must be between 0 and 100"
            });
        }

        const student = new Student({
            name: name,
            rollNo: rollNo,
            course: course,
            marks: Number(marks)
        });

        const savedStudent = await student.save();

        return res.status(201).json({
            message: "Student added successfully",
            student: savedStudent
        });

    } catch (error) {
        console.log("POST ERROR:", error);

        return res.status(500).json({
            message: error.message
        });
    }
});


// GET ALL STUDENTS
router.get("/", async (req, res) => {
    try {
        const students = await Student.find();

        return res.status(200).json(students);

    } catch (error) {
        console.log("GET ERROR:", error);

        return res.status(500).json({
            message: error.message
        });
    }
});


// GET ONE STUDENT
router.get("/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        return res.status(200).json(student);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});


// UPDATE STUDENT
router.put("/:id", async (req, res) => {
    try {
        const { name, rollNo, course, marks } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name,
                rollNo,
                course,
                marks: Number(marks)
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        return res.status(200).json({
            message: "Student updated successfully",
            student: student
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});


// DELETE STUDENT
router.delete("/:id", async (req, res) => {
    try {
        const student =
            await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        return res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});


module.exports = router;