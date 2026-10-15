const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

app.use(express.json());

// MongoDB Connection
mongoose
    .connect("mongodb://127.0.0.1:27017/studentDB")
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });

// Student Schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    rollNo: {
        type: String,
        required: true,
        unique: true
    },

    course: {
        type: String,
        required: true
    },

    marks: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
});

const Student = mongoose.model("Student", studentSchema);


// =====================================================
// GET ALL STUDENTS
// =====================================================

app.get("/students", async (req, res) => {

    try {

        const students = await Student.find();

        res.json(students);

    } catch (error) {

        res.status(500).json({
            message: "Error fetching students"
        });

    }

});


// =====================================================
// GET SINGLE STUDENT
// =====================================================

app.get("/students/:id", async (req, res) => {

    try {

        const student =
            await Student.findById(req.params.id);

        if (!student) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json(student);

    } catch (error) {

        res.status(400).json({
            message: "Invalid student ID"
        });

    }

});


// =====================================================
// POST - ADD STUDENT
// =====================================================

app.post("/students", async (req, res) => {

    try {

        const {
            name,
            rollNo,
            course,
            marks
        } = req.body;

        if (!name || !rollNo || !course || marks === undefined) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        if (marks < 0 || marks > 100) {

            return res.status(400).json({
                message: "Marks must be between 0 and 100"
            });

        }

        const student = new Student({
            name,
            rollNo,
            course,
            marks
        });

        await student.save();

        res.status(201).json(student);

    } catch (error) {

        if (error.code === 11000) {

            return res.status(400).json({
                message: "Roll number already exists"
            });

        }

        res.status(500).json({
            message: "Error adding student"
        });

    }

});


// =====================================================
// PUT - UPDATE STUDENT
// =====================================================

app.put("/students/:id", async (req, res) => {

    try {

        const {
            name,
            rollNo,
            course,
            marks
        } = req.body;

        if (!name || !rollNo || !course || marks === undefined) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        if (marks < 0 || marks > 100) {

            return res.status(400).json({
                message: "Marks must be between 0 and 100"
            });

        }

        const student =
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

        if (!student) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json(student);

    } catch (error) {

        res.status(400).json({
            message: "Error updating student"
        });

    }

});


// =====================================================
// DELETE STUDENT
// =====================================================

app.delete("/students/:id", async (req, res) => {

    try {

        const student =
            await Student.findByIdAndDelete(req.params.id);

        if (!student) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {

        res.status(400).json({
            message: "Error deleting student"
        });

    }

});


// =====================================================
// FRONTEND
// =====================================================

app.get("/", (req, res) => {

    res.send(`

<!DOCTYPE html>

<html>

<head>

    <title>Student Record Management</title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f7fb;
            color: #172238;
        }

        header {
            background: #172238;
            color: white;
            padding: 22px;
            text-align: center;
        }

        header h1 {
            margin: 0;
            font-size: 28px;
        }

        .container {
            width: 90%;
            max-width: 1100px;
            margin: 30px auto;
        }

        .form-box {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 25px;
        }

        .form-box h2 {
            margin-top: 0;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccd5df;
            border-radius: 6px;
            font-size: 15px;
        }

        button {
            border: none;
            padding: 11px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }

        .add-btn {
            background: #1769aa;
            color: white;
            margin-top: 15px;
        }

        .cancel-btn {
            background: #777;
            color: white;
            margin-top: 15px;
            margin-left: 8px;
        }

        .table-box {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #e8eef6;
            padding: 13px;
            text-align: center;
        }

        td {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #e1e5ea;
        }

        .edit {
            background: #f0ad4e;
            color: white;
            margin-right: 5px;
        }

        .delete {
            background: #d9534f;
            color: white;
        }

        .message {
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 6px;
            background: #e7f3ff;
            color: #1769aa;
            display: none;
        }

        .empty {
            text-align: center;
            padding: 20px;
            color: #777;
        }

        @media (max-width: 700px) {

            .form-grid {
                grid-template-columns: 1fr;
            }

            .container {
                width: 95%;
            }

        }

    </style>

</head>


<body>


<header>

    <h1>Student Record Management System</h1>

</header>


<div class="container">


    <div id="message" class="message"></div>


    <div class="form-box">

        <h2 id="formTitle">Add Student</h2>


        <form id="studentForm">


            <div class="form-grid">


                <input
                    type="text"
                    id="name"
                    placeholder="Student Name"
                    required
                >


                <input
                    type="text"
                    id="rollNo"
                    placeholder="Roll No."
                    required
                >


                <input
                    type="text"
                    id="course"
                    placeholder="Course"
                    required
                >


                <input
                    type="number"
                    id="marks"
                    placeholder="Marks (0-100)"
                    min="0"
                    max="100"
                    required
                >


            </div>


            <button
                type="submit"
                class="add-btn"
                id="submitBtn"
            >
                Add Student
            </button>


            <button
                type="button"
                class="cancel-btn"
                id="cancelBtn"
                onclick="cancelEdit()"
                style="display:none;"
            >
                Cancel
            </button>


        </form>

    </div>


    <div class="table-box">


        <h2>Student Records</h2>


        <table>


            <thead>

                <tr>

                    <th>Name</th>

                    <th>Roll No.</th>

                    <th>Course</th>

                    <th>Marks</th>

                    <th>Actions</th>

                </tr>

            </thead>


            <tbody id="studentTable">

            </tbody>


        </table>


    </div>


</div>


<script>


let editingId = null;


// Show message
function showMessage(text) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.style.display = "block";

    setTimeout(() => {

        message.style.display = "none";

    }, 2500);

}


// Load students
async function loadStudents() {

    try {

        const response =
            await fetch("/students");

        const students =
            await response.json();

        const table =
            document.getElementById("studentTable");

        table.innerHTML = "";


        if (students.length === 0) {

            table.innerHTML = \`

                <tr>

                    <td colspan="5" class="empty">

                        No student records found.

                    </td>

                </tr>

            \`;

            return;

        }


        students.forEach(student => {

            table.innerHTML += \`

                <tr>

                    <td>
                        \${student.name}
                    </td>

                    <td>
                        \${student.rollNo}
                    </td>

                    <td>
                        \${student.course}
                    </td>

                    <td>
                        \${student.marks}
                    </td>

                    <td>

                        <button
                            class="edit"
                            onclick="editStudent('\${student._id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete"
                            onclick="deleteStudent('\${student._id}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            \`;

        });


    } catch (error) {

        showMessage("Unable to load students");

    }

}


// Add / Update student
document
    .getElementById("studentForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById("name")
                .value
                .trim();


            const rollNo =
                document.getElementById("rollNo")
                .value
                .trim();


            const course =
                document.getElementById("course")
                .value
                .trim();


            const marks =
                Number(
                    document.getElementById("marks")
                    .value
                );


            if (!name || !rollNo || !course) {

                showMessage(
                    "Please fill in all fields"
                );

                return;

            }


            if (marks < 0 || marks > 100) {

                showMessage(
                    "Marks must be between 0 and 100"
                );

                return;

            }


            const studentData = {

                name: name,

                rollNo: rollNo,

                course: course,

                marks: marks

            };


            try {

                let response;


                if (editingId) {

                    response = await fetch(

                        "/students/" + editingId,

                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(studentData)

                        }

                    );

                } else {

                    response = await fetch(

                        "/students",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(studentData)

                        }

                    );

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    showMessage(data.message);

                    return;

                }


                if (editingId) {

                    showMessage(
                        "Student updated successfully"
                    );

                } else {

                    showMessage(
                        "Student added successfully"
                    );

                }


                resetForm();

                loadStudents();


            } catch (error) {

                showMessage("Server error");

            }

        }
    );


// Edit student
async function editStudent(id) {

    try {

        const response =
            await fetch("/students/" + id);

        const student =
            await response.json();


        if (!response.ok) {

            showMessage(student.message);

            return;

        }


        document.getElementById("name").value =
            student.name;


        document.getElementById("rollNo").value =
            student.rollNo;


        document.getElementById("course").value =
            student.course;


        document.getElementById("marks").value =
            student.marks;


        editingId = id;


        document.getElementById("formTitle")
            .textContent = "Edit Student";


        document.getElementById("submitBtn")
            .textContent = "Update Student";


        document.getElementById("cancelBtn")
            .style.display = "inline-block";


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    } catch (error) {

        showMessage(
            "Unable to edit student"
        );

    }

}


// Delete student
async function deleteStudent(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(

                "/students/" + id,

                {

                    method: "DELETE"

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(data.message);

            return;

        }


        showMessage(
            "Student deleted successfully"
        );


        loadStudents();


    } catch (error) {

        showMessage(
            "Unable to delete student"
        );

    }

}


// Cancel edit
function cancelEdit() {

    resetForm();

}


// Reset form
function resetForm() {

    document
        .getElementById("studentForm")
        .reset();


    editingId = null;


    document.getElementById("formTitle")
        .textContent = "Add Student";


    document.getElementById("submitBtn")
        .textContent = "Add Student";


    document.getElementById("cancelBtn")
        .style.display = "none";

}


// Initial load
loadStudents();


</script>


</body>

</html>

    `);

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        "Server running at http://localhost:" + PORT
    );

});