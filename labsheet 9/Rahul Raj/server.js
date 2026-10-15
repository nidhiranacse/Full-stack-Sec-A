/**
 * Express REST API Server
 * Lab Sheet 09 - Student Record Management System
 * Student: Rahul Raj (cu24250116)
 * Course: Full Stack Web Development (Sec-A)
 */

const express = require('express');
const cors = require('cors');
const path = require('node:path');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// REST API Endpoints (Syllabus Section 5)
// ==========================================

// 1. GET /students -> Fetch all student records
app.get('/students', (req, res) => {
  try {
    const students = Student.findAll();
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /students/:id -> Fetch a single student record by ID
app.get('/students/:id', (req, res) => {
  try {
    const student = Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student with ID ${req.params.id} not found` });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /students -> Add a new student record
app.post('/students', (req, res) => {
  try {
    const { name, rollNo, course, marks } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student name is required' });
    }
    if (!rollNo || !rollNo.trim()) {
      return res.status(400).json({ success: false, message: 'Roll number is required' });
    }
    if (!course || !course.trim()) {
      return res.status(400).json({ success: false, message: 'Course is required' });
    }
    const parsedMarks = parseFloat(marks);
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      return res.status(400).json({ success: false, message: 'Marks must be a numeric value between 0 and 100' });
    }

    // Unique rollNo check
    const existing = Student.findByRollNo(rollNo.trim());
    if (existing) {
      return res.status(409).json({ success: false, message: `Roll number ${rollNo} already exists in database` });
    }

    const newStudent = Student.create({
      name: name.trim(),
      rollNo: rollNo.trim(),
      course: course.trim(),
      marks: parsedMarks
    });

    res.status(201).json({
      success: true,
      message: 'Student record successfully created',
      data: newStudent
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. PUT /students/:id -> Update an existing student record
app.put('/students/:id', (req, res) => {
  try {
    const studentId = req.params.id;
    const existing = Student.findById(studentId);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Student with ID ${studentId} not found` });
    }

    const { name, rollNo, course, marks } = req.body;

    // Marks validation if provided
    if (marks !== undefined) {
      const parsedMarks = parseFloat(marks);
      if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
        return res.status(400).json({ success: false, message: 'Marks must be between 0 and 100' });
      }
    }

    // Check duplicate rollNo
    if (rollNo && rollNo.trim() !== existing.rollNo) {
      const duplicate = Student.findByRollNo(rollNo.trim(), studentId);
      if (duplicate) {
        return res.status(409).json({ success: false, message: `Roll number ${rollNo} already assigned to another student` });
      }
    }

    const updated = Student.update(studentId, {
      name: name !== undefined ? name.trim() : existing.name,
      rollNo: rollNo !== undefined ? rollNo.trim() : existing.rollNo,
      course: course !== undefined ? course.trim() : existing.course,
      marks: marks !== undefined ? parseFloat(marks) : existing.marks
    });

    res.status(200).json({
      success: true,
      message: 'Student record successfully updated',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE /students/:id -> Delete a student record
app.delete('/students/:id', (req, res) => {
  try {
    const studentId = req.params.id;
    const deleted = Student.delete(studentId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Student with ID ${studentId} not found` });
    }
    res.status(200).json({
      success: true,
      message: `Student record with ID ${studentId} successfully deleted`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root fallback to frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Student Record Management Server running on port ${PORT}`);
    console.log(` Student: Rahul Raj | cu24250116 | Full-stack Sec-A`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
