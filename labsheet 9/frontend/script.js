const API_URL = "/students";

// ===============================
// Get HTML Elements
// ===============================

const form = document.getElementById("studentForm");

const nameInput = document.getElementById("name");
const rollNoInput = document.getElementById("rollNo");
const courseInput = document.getElementById("course");
const marksInput = document.getElementById("marks");

const studentIdInput = document.getElementById("studentId");

const tableBody =
    document.getElementById("studentTableBody");

const submitBtn =
    document.getElementById("submitBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const formTitle =
    document.getElementById("formTitle");

const message =
    document.getElementById("message");


// ===============================
// Fetch All Students
// ===============================

async function fetchStudents() {

    try {

        const response = await fetch(API_URL);

        const text = await response.text();

        let students = [];

        if (text) {
            students = JSON.parse(text);
        }

        if (!response.ok) {
            throw new Error(
                students.message || "Failed to fetch students"
            );
        }

        displayStudents(students);

    } catch (error) {

        console.error("Fetch Error:", error);

        showMessage(
            "Unable to connect to server.",
            "error"
        );
    }
}


// ===============================
// Display Students
// ===============================

function displayStudents(students) {

    tableBody.innerHTML = "";


    if (!Array.isArray(students) || students.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No student records found
                </td>
            </tr>
        `;

        return;
    }


    students.forEach((student) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>
                ${student.name}
            </td>

            <td>
                ${student.rollNo}
            </td>

            <td>
                ${student.course}
            </td>

            <td>
                ${student.marks}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editStudent('${student._id}')"
                >
                    ✏ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent('${student._id}')"
                >
                    🗑 Delete
                </button>

            </td>

        `;

        tableBody.appendChild(row);

    });
}


// ===============================
// Add / Update Student
// ===============================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Get values

        const name =
            nameInput.value.trim();

        const rollNo =
            rollNoInput.value.trim();

        const course =
            courseInput.value.trim();

        const marks =
            Number(marksInput.value);


        // ===============================
        // Client-side Validation
        // ===============================

        if (!name) {

            showMessage(
                "Student name is required.",
                "error"
            );

            nameInput.focus();

            return;
        }


        if (!rollNo) {

            showMessage(
                "Roll number is required.",
                "error"
            );

            rollNoInput.focus();

            return;
        }


        if (!course) {

            showMessage(
                "Course is required.",
                "error"
            );

            courseInput.focus();

            return;
        }


        if (
            marksInput.value === "" ||
            marks < 0 ||
            marks > 100
        ) {

            showMessage(
                "Marks must be between 0 and 100.",
                "error"
            );

            marksInput.focus();

            return;
        }


        // Student object

        const studentData = {

            name: name,

            rollNo: rollNo,

            course: course,

            marks: marks

        };


        try {

            let response;


            // ===============================
            // UPDATE
            // ===============================

            if (studentIdInput.value) {

                response = await fetch(
                    `${API_URL}/${studentIdInput.value}`,
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

            }


            // ===============================
            // CREATE
            // ===============================

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
                            JSON.stringify(studentData)
                    }
                );

            }


            // ===============================
            // Read Response Safely
            // ===============================

            const text =
                await response.text();

            let result = {};

            if (text) {

                try {

                    result = JSON.parse(text);

                } catch (jsonError) {

                    console.error(
                        "Invalid JSON:",
                        text
                    );

                    throw new Error(
                        "Server returned an invalid response."
                    );
                }
            }


            // ===============================
            // Check Response
            // ===============================

            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Something went wrong."
                );
            }


            // ===============================
            // Success Message
            // ===============================

            if (studentIdInput.value) {

                showMessage(
                    "Student updated successfully!",
                    "success"
                );

            } else {

                showMessage(
                    "Student added successfully!",
                    "success"
                );
            }


            // Reset form

            resetForm();


            // Refresh table

            await fetchStudents();

        } catch (error) {

            console.error(
                "Submit Error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to connect to server.",
                "error"
            );
        }

    }
);


// ===============================
// Edit Student
// ===============================

async function editStudent(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );


        const text =
            await response.text();


        let student = {};

        if (text) {
            student = JSON.parse(text);
        }


        if (!response.ok) {

            throw new Error(
                student.message ||
                "Unable to get student."
            );
        }


        // Fill form

        studentIdInput.value =
            student._id;

        nameInput.value =
            student.name;

        rollNoInput.value =
            student.rollNo;

        courseInput.value =
            student.course;

        marksInput.value =
            student.marks;


        // Change form heading

        formTitle.textContent =
            "Update Student";


        // Change button

        submitBtn.textContent =
            "Update Student";


        // Show cancel

        cancelBtn.style.display =
            "block";


        // Scroll to form

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit Error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );
    }
}


// ===============================
// Delete Student
// ===============================

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


        const text =
            await response.text();


        let result = {};

        if (text) {
            result = JSON.parse(text);
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete student."
            );
        }


        showMessage(
            "Student deleted successfully!",
            "success"
        );


        // Refresh table

        await fetchStudents();


    } catch (error) {

        console.error(
            "Delete Error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );
    }
}


// ===============================
// Cancel Edit
// ===============================

function cancelEdit() {

    resetForm();

}


// ===============================
// Reset Form
// ===============================

function resetForm() {

    form.reset();

    studentIdInput.value = "";

    formTitle.textContent =
        "Add Student";

    submitBtn.textContent =
        "Add Student";

    cancelBtn.style.display =
        "none";
}


// ===============================
// Show Message
// ===============================

function showMessage(text, type) {

    message.textContent = text;


    if (type === "success") {

        message.style.background =
            "#dcfce7";

        message.style.color =
            "#166534";

        message.style.border =
            "1px solid #86efac";

    } else {

        message.style.background =
            "#fee2e2";

        message.style.color =
            "#991b1b";

        message.style.border =
            "1px solid #fca5a5";
    }


    setTimeout(() => {

        message.textContent = "";

        message.style.background = "";

        message.style.color = "";

        message.style.border = "";

    }, 3000);
}


// ===============================
// Load Students on Page Load
// ===============================

fetchStudents();