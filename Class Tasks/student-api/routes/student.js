// ========================================
// IMPORT EXPRESS
// ========================================

const express = require("express");


// Create router
const router = express.Router();


// ========================================
// IN-MEMORY STUDENT ARRAY
// No database is required
// ========================================

let students = [

    {
        id: 1,
        name: "Love",
        age: 20,
        course: "B.Tech CSE"
    },

    {
        id: 2,
        name: "Rahul",
        age: 21,
        course: "B.Tech IT"
    },

    {
        id: 3,
        name: "Priya",
        age: 20,
        course: "BCA"
    }

];


// ========================================
// GET /students
// Return ALL students
// ========================================

router.get("/", (req, res) => {

    res.json({
        success: true,
        count: students.length,
        students: students
    });

});


// ========================================
// GET /students/:id
// Return ONE student
// ========================================

router.get("/:id", (req, res) => {

    // Convert URL id from string to number
    const id = parseInt(req.params.id);

    // Find student with matching ID
    const student = students.find(
        student => student.id === id
    );


    // If student doesn't exist
    if (!student) {

        return res.status(404).json({
            success: false,
            message: "Student not found"
        });

    }


    // Return student
    res.json({
        success: true,
        student: student
    });

});


// ========================================
// POST /students
// ADD a new student
// ========================================

router.post("/", (req, res) => {

    // Get data from request body
    const {
        name,
        age,
        course
    } = req.body;


    // Validate required fields
    if (!name || !age || !course) {

        return res.status(400).json({
            success: false,
            message: "Name, age and course are required"
        });

    }


    // Create new student
    const newStudent = {

        // Generate new ID
        id: students.length > 0
            ? students[students.length - 1].id + 1
            : 1,

        name: name,

        age: age,

        course: course
    };


    // Add student to array
    students.push(newStudent);


    // Send response
    res.status(201).json({

        success: true,

        message: "Student added successfully",

        student: newStudent

    });

});


// ========================================
// PUT /students/:id
// UPDATE a student
// ========================================

router.put("/:id", (req, res) => {

    // Get student ID
    const id = parseInt(req.params.id);


    // Find student
    const student = students.find(
        student => student.id === id
    );


    // Student not found
    if (!student) {

        return res.status(404).json({

            success: false,

            message: "Student not found"

        });

    }


    // Get updated data
    const {
        name,
        age,
        course
    } = req.body;


    // Update only provided fields
    if (name !== undefined) {
        student.name = name;
    }

    if (age !== undefined) {
        student.age = age;
    }

    if (course !== undefined) {
        student.course = course;
    }


    // Return updated student
    res.json({

        success: true,

        message: "Student updated successfully",

        student: student

    });

});


// ========================================
// DELETE /students/:id
// DELETE a student
// ========================================

router.delete("/:id", (req, res) => {

    // Get ID from URL
    const id = parseInt(req.params.id);


    // Find index of student
    const studentIndex = students.findIndex(
        student => student.id === id
    );


    // Student not found
    if (studentIndex === -1) {

        return res.status(404).json({

            success: false,

            message: "Student not found"

        });

    }


    // Remove student from array
    const deletedStudent =
        students.splice(studentIndex, 1);


    // Send response
    res.json({

        success: true,

        message: "Student deleted successfully",

        student: deletedStudent[0]

    });

});


// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;