const API_URL =
    "http://localhost:5000/students";

const studentForm =
    document.getElementById("student-form");

const studentId =
    document.getElementById("student-id");

const nameInput =
    document.getElementById("name");

const rollNoInput =
    document.getElementById("rollNo");

const courseInput =
    document.getElementById("course");

const marksInput =
    document.getElementById("marks");

const tableBody =
    document.getElementById(
        "student-table-body"
    );

const formTitle =
    document.getElementById("form-title");

const submitButton =
    document.getElementById("submit-btn");

const cancelButton =
    document.getElementById("cancel-btn");

const message =
    document.getElementById("message");


// GET - Fetch Students
document.addEventListener(
    "DOMContentLoaded",
    fetchStudents
);

async function fetchStudents() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "Failed to fetch students"
            );
        }

        const students =
            await response.json();

        displayStudents(students);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to load student records.";
    }
}


// Display Students
function displayStudents(students) {

    tableBody.innerHTML = "";

    if (students.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No student records found
                </td>
            </tr>
        `;

        return;
    }

    students.forEach((student) => {

        const row =
            document.createElement("tr");

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
}


// POST / PUT
studentForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const name =
            nameInput.value.trim();

        const rollNo =
            rollNoInput.value.trim();

        const course =
            courseInput.value.trim();

        const marks =
            Number(marksInput.value);


        // Validation
        if (!name || !rollNo || !course) {

            message.textContent =
                "All fields are required.";

            return;
        }

        if (
            isNaN(marks) ||
            marks < 0 ||
            marks > 100
        ) {

            message.textContent =
                "Marks must be between 0 and 100.";

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
            if (studentId.value) {

                response = await fetch(
                    `${API_URL}/${studentId.value}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                studentData
                            )
                    }
                );

            }

            // CREATE
            else {

                response = await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                studentData
                            )
                    }
                );
            }


            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Operation failed"
                );
            }


            message.textContent =
                data.message;

            resetForm();

            fetchStudents();

        } catch (error) {

            console.error(error);

            message.textContent =
                error.message;
        }
    }
);


// Edit Student
async function editStudent(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );

        const student =
            await response.json();

        studentId.value =
            student._id;

        nameInput.value =
            student.name;

        rollNoInput.value =
            student.rollNo;

        courseInput.value =
            student.course;

        marksInput.value =
            student.marks;

        formTitle.textContent =
            "Edit Student";

        submitButton.textContent =
            "Update Student";

        cancelButton.style.display =
            "inline-block";

    } catch (error) {

        message.textContent =
            "Unable to load student.";
    }
}


// Delete Student
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
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        message.textContent =
            data.message;

        fetchStudents();

    } catch (error) {

        message.textContent =
            "Failed to delete student.";
    }
}


// Reset Form
function resetForm() {

    studentForm.reset();

    studentId.value = "";

    formTitle.textContent =
        "Add Student";

    submitButton.textContent =
        "Add Student";

    cancelButton.style.display =
        "none";
}


// Cancel Edit
function cancelEdit() {

    resetForm();

    message.textContent = "";
}