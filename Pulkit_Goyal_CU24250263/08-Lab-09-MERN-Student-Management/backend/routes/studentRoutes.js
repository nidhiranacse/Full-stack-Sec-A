const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// @route   GET /api/students
// @desc    Get all students with optional search query (?search=...)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let queryFilter = {};

    if (search) {
      queryFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { cuid: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const students = await Student.find(queryFilter).sort({ rollNumber: 1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/students
// @desc    Register a new student
router.post('/', async (req, res) => {
  try {
    const { name, cuid, rollNumber, email, course, marks } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ cuid }, { email }] });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this CUID or Email is already registered'
      });
    }

    const newStudent = await Student.create({
      name,
      cuid,
      rollNumber,
      email,
      course,
      marks
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: newStudent
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update an existing student record
router.put('/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student record
router.delete('/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      message: `Student ${deletedStudent.name} removed successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
