const express = require('express');
const router = express.Router();

const Student = require('../models/student');


// ============================================================
// GET ALL STUDENTS
// GET /students
// ============================================================

router.get('/', async (req, res) => {
    try {
        const students = await Student.find();

        res.json(students);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// ============================================================
// GET ONE STUDENT
// GET /students/:id
// ============================================================

router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.json(student);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});


// ============================================================
// ADD STUDENT
// POST /students
// ============================================================

router.post('/', async (req, res) => {
    try {

        const student = new Student({
            name: req.body.name,
            rollNo: req.body.rollNo,
            course: req.body.course,
            marks: req.body.marks
        });

        const savedStudent = await student.save();

        res.status(201).json(savedStudent);

    } catch (error) {

        res.status(400).json({
            error: error.message
        });
    }
});


// ============================================================
// UPDATE STUDENT
// PUT /students/:id
// ============================================================

router.put('/:id', async (req, res) => {
    try {

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                rollNo: req.body.rollNo,
                course: req.body.course,
                marks: req.body.marks
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.json(student);

    } catch (error) {

        res.status(400).json({
            error: error.message
        });
    }
});


// ============================================================
// DELETE STUDENT
// DELETE /students/:id
// ============================================================

router.delete('/:id', async (req, res) => {
    try {

        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.json({
            message: 'Student deleted successfully'
        });

    } catch (error) {

        res.status(400).json({
            error: error.message
        });
    }
});


module.exports = router;