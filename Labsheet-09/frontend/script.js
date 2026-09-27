const API_URL = "http://localhost:5000/students";

const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");


// GET - Fetch all students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();

        tableBody.innerHTML = "";

        students.forEach(student => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.rollNo}</td>
                <td>${student.course}</td>
                <td>${student.marks}</td>
                <td>
                    <button
                        class="edit"
                        onclick="editStudent('${student._id}')">
                        Edit
                    </button>

                    <button
                        class="delete"
                        onclick="deleteStudent('${student._id}')">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching students:", error);
    }
}


// POST - Add student
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const rollNo = document.getElementById("rollNo").value.trim();
    const course = document.getElementById("course").value.trim();
    const marks = Number(document.getElementById("marks").value);


    // Client-side validation
    if (!name || !rollNo || !course) {
        alert("Please fill all fields.");
        return;
    }

    if (marks < 0 || marks > 100) {
        alert("Marks must be between 0 and 100.");
        return;
    }


    try {
        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                rollNo: rollNo,
                course: course,
                marks: marks
            })
        });


        if (!response.ok) {
            const error = await response.json();
            alert(error.message);
            return;
        }

        alert("Student added successfully!");

        form.reset();

        fetchStudents();

    } catch (error) {
        console.error("Error adding student:", error);
        alert("Unable to connect to server.");
    }
});


// PUT - Edit student
async function editStudent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();

        const name = prompt(
            "Enter student name:",
            student.name
        );

        const rollNo = prompt(
            "Enter roll number:",
            student.rollNo
        );

        const course = prompt(
            "Enter course:",
            student.course
        );

        const marks = prompt(
            "Enter marks:",
            student.marks
        );


        if (
            name === null ||
            rollNo === null ||
            course === null ||
            marks === null
        ) {
            return;
        }


        const marksNumber = Number(marks);

        if (marksNumber < 0 || marksNumber > 100) {
            alert("Marks must be between 0 and 100.");
            return;
        }


        const updateResponse = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    rollNo: rollNo,
                    course: course,
                    marks: marksNumber
                })
            }
        );


        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            alert(error.message);
            return;
        }

        alert("Student updated successfully!");

        fetchStudents();

    } catch (error) {
        console.error("Error updating student:", error);
    }
}


// DELETE - Delete student
async function deleteStudent(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmation) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            alert("Unable to delete student.");
            return;
        }


        alert("Student deleted successfully!");

        fetchStudents();

    } catch (error) {
        console.error("Error deleting student:", error);
    }
}


// Load students when page opens
fetchStudents();