// ========================================
// REST API FOR STUDENT RECORDS
// Node.js + Express
// ========================================


// ========================================
// IMPORT PACKAGES
// ========================================

const express = require("express");
const cors = require("cors");


// Create Express application
const app = express();


// ========================================
// MIDDLEWARE
// ========================================

// Allow frontend to communicate with backend
app.use(cors());

// Allow Express to read JSON request bodies
app.use(express.json());


// ========================================
// IN-MEMORY STUDENT ARRAY
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
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({
        message: "Student REST API is running"
    });

});


// ========================================
// GET ALL STUDENTS
// GET /students
// ========================================

app.get("/students", (req, res) => {

    res.json({

        success: true,

        count: students.length,

        students: students

    });

});


// ========================================
// GET ONE STUDENT
// GET /students/:id
// ========================================

app.get("/students/:id", (req, res) => {

    const id = parseInt(req.params.id);


    const student = students.find(
        student => student.id === id
    );


    if (!student) {

        return res.status(404).json({

            success: false,

            message: "Student not found"

        });

    }


    res.json({

        success: true,

        student: student

    });

});


// ========================================
// ADD STUDENT
// POST /students
// ========================================

app.post("/students", (req, res) => {

    const {
        name,
        age,
        course
    } = req.body;


    // Check required fields
    if (!name || !age || !course) {

        return res.status(400).json({

            success: false,

            message:
                "Name, age and course are required"

        });

    }


    // Generate next ID
    const newId =
        students.length > 0
            ? Math.max(
                ...students.map(
                    student => student.id
                )
            ) + 1
            : 1;


    // Create new student
    const newStudent = {

        id: newId,

        name: name,

        age: age,

        course: course

    };


    // Add to array
    students.push(newStudent);


    // Send response
    res.status(201).json({

        success: true,

        message: "Student added successfully",

        student: newStudent

    });

});


// ========================================
// UPDATE STUDENT
// PUT /students/:id
// ========================================

app.put("/students/:id", (req, res) => {

    const id = parseInt(req.params.id);


    const student = students.find(
        student => student.id === id
    );


    if (!student) {

        return res.status(404).json({

            success: false,

            message: "Student not found"

        });

    }


    const {
        name,
        age,
        course
    } = req.body;


    // Update provided values
    if (name !== undefined) {
        student.name = name;
    }

    if (age !== undefined) {
        student.age = age;
    }

    if (course !== undefined) {
        student.course = course;
    }


    res.json({

        success: true,

        message: "Student updated successfully",

        student: student

    });

});


// ========================================
// DELETE STUDENT
// DELETE /students/:id
// ========================================

app.delete("/students/:id", (req, res) => {

    const id = parseInt(req.params.id);


    const studentIndex =
        students.findIndex(
            student => student.id === id
        );


    if (studentIndex === -1) {

        return res.status(404).json({

            success: false,

            message: "Student not found"

        });

    }


    // Remove student
    const deletedStudent =
        students.splice(studentIndex, 1);


    res.json({

        success: true,

        message: "Student deleted successfully",

        student: deletedStudent[0]

    });

});


// ========================================
// START SERVER
// ========================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});