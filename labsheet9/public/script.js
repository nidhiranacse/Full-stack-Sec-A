const form = document.getElementById("studentForm");

const nameInput = document.getElementById("name");
const rollNoInput = document.getElementById("rollNo");
const courseInput = document.getElementById("course");
const marksInput = document.getElementById("marks");

const studentIdInput = document.getElementById("studentId");

const tableBody = document.getElementById("studentTableBody");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

// =====================================
// GET ALL STUDENTS
// =====================================
async function loadStudents() {

    try {

        const response = await fetch("/students");

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
                        class="edit-btn"
                        onclick="editStudent('${student._id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteStudent('${student._id}')"
                    >
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);

        });

    } catch (error) {

        console.log("Error:", error);

    }
}

// =====================================
// ADD / UPDATE STUDENT
// =====================================
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = nameInput.value.trim();
    const rollNo = rollNoInput.value.trim();
    const course = courseInput.value.trim();
    const marks = Number(marksInput.value);

    // Client-side validation
    if (!name || !rollNo || !course) {

        alert("Please fill all fields.");

        return;
    }

    if (marks < 0 || marks > 100) {

        alert("Marks must be between 0 and 100.");

        return;
    }

    const studentData = {
        name,
        rollNo,
        course,
        marks
    };

    try {

        let response;

        // UPDATE
        if (studentIdInput.value) {

            response = await fetch(
                `/students/${studentIdInput.value}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(studentData)
                }
            );

        }

        // ADD
        else {

            response = await fetch(
                "/students",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(studentData)
                }
            );

        }

        const result = await response.json();

        if (!response.ok) {

            alert(result.message);

            return;
        }

        alert(
            studentIdInput.value
                ? "Student updated successfully!"
                : "Student added successfully!"
        );

        resetForm();

        loadStudents();

    } catch (error) {

        console.log("Error:", error);

        alert("Something went wrong.");

    }

});

// =====================================
// EDIT STUDENT
// =====================================
async function editStudent(id) {

    try {

        const response = await fetch(`/students/${id}`);

        const student = await response.json();

        nameInput.value = student.name;
        rollNoInput.value = student.rollNo;
        courseInput.value = student.course;
        marksInput.value = student.marks;

        studentIdInput.value = student._id;

        submitButton.textContent = "Update Student";

        cancelButton.style.display = "inline-block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.log("Error:", error);

    }
}

// =====================================
// DELETE STUDENT
// =====================================
async function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `/students/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        alert(result.message);

        loadStudents();

    } catch (error) {

        console.log("Error:", error);

    }
}

// =====================================
// CANCEL EDIT
// =====================================
function cancelEdit() {

    resetForm();

}

// =====================================
// RESET FORM
// =====================================
function resetForm() {

    form.reset();

    studentIdInput.value = "";

    submitButton.textContent = "Add Student";

    cancelButton.style.display = "none";
}

// Load students when page opens
loadStudents();