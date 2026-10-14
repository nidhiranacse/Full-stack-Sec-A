// ========================================
// API BASE URL
// ========================================

// Our Express backend is running on port 3000
const API_URL = "http://localhost:3000/students";


// ========================================
// GET HTML ELEMENTS
// ========================================

const studentForm =
    document.getElementById("studentForm");

const nameInput =
    document.getElementById("name");

const ageInput =
    document.getElementById("age");

const courseInput =
    document.getElementById("course");

const studentList =
    document.getElementById("studentList");

const studentCount =
    document.getElementById("studentCount");

const loading =
    document.getElementById("loading");

const emptyMessage =
    document.getElementById("emptyMessage");

const submitButton =
    document.getElementById("submitButton");

const cancelButton =
    document.getElementById("cancelButton");

const formTitle =
    document.getElementById("formTitle");

const refreshButton =
    document.getElementById("refreshButton");

const statusMessage =
    document.getElementById("statusMessage");


// ========================================
// EDIT MODE
// ========================================

// Stores the ID of the student being edited
let editingStudentId = null;


// ========================================
// SHOW STATUS MESSAGE
// ========================================

function showMessage(message) {

    statusMessage.textContent = message;

    statusMessage.classList.add("show");


    // Hide after 3 seconds
    setTimeout(() => {

        statusMessage.classList.remove("show");

    }, 3000);
}


// ========================================
// GET ALL STUDENTS
// GET /students
// ========================================

async function fetchStudents() {

    try {

        // Show loading
        loading.style.display = "block";

        // Get data from backend
        const response = await fetch(API_URL);

        // Convert response to JSON
        const data = await response.json();


        // Display students
        displayStudents(data.students);


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server."
        );

    } finally {

        // Hide loading
        loading.style.display = "none";

    }
}


// ========================================
// DISPLAY STUDENTS
// ========================================

function displayStudents(students) {

    // Clear previous cards
    studentList.innerHTML = "";


    // Update student count
    studentCount.textContent = students.length;


    // If there are no students
    if (students.length === 0) {

        emptyMessage.hidden = false;

        return;

    }


    // Hide empty message
    emptyMessage.hidden = true;


    // Create a card for every student
    students.forEach(student => {

        // Create student card
        const card =
            document.createElement("div");

        card.classList.add("student-card");


        // Create ID
        const id =
            document.createElement("span");

        id.classList.add("student-id");

        id.textContent =
            `ID: ${student.id}`;


        // Create name
        const name =
            document.createElement("h3");

        name.textContent =
            student.name;


        // Create age
        const age =
            document.createElement("p");

        age.classList.add("student-detail");

        age.textContent =
            `Age: ${student.age}`;


        // Create course
        const course =
            document.createElement("p");

        course.classList.add("student-detail");

        course.textContent =
            `Course: ${student.course}`;


        // Create action container
        const actions =
            document.createElement("div");

        actions.classList.add("card-actions");


        // Create edit button
        const editButton =
            document.createElement("button");

        editButton.classList.add("edit-btn");

        editButton.textContent = "Edit";


        // Edit button event
        editButton.addEventListener(
            "click",
            () => editStudent(student)
        );


        // Create delete button
        const deleteButton =
            document.createElement("button");

        deleteButton.classList.add("delete-btn");

        deleteButton.textContent = "Delete";


        // Delete button event
        deleteButton.addEventListener(
            "click",
            () => deleteStudent(student.id)
        );


        // Add buttons
        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        // Add elements to card
        card.appendChild(id);

        card.appendChild(name);

        card.appendChild(age);

        card.appendChild(course);

        card.appendChild(actions);


        // Add card to page
        studentList.appendChild(card);

    });
}


// ========================================
// ADD OR UPDATE STUDENT
// ========================================

studentForm.addEventListener(
    "submit",
    async (event) => {

        // Stop page refresh
        event.preventDefault();


        // Get input values
        const studentData = {

            name: nameInput.value.trim(),

            age: Number(ageInput.value),

            course: courseInput.value.trim()

        };


        // Basic validation
        if (
            !studentData.name ||
            !studentData.age ||
            !studentData.course
        ) {

            showMessage(
                "Please fill all fields."
            );

            return;

        }


        try {

            let response;


            // =================================
            // UPDATE STUDENT
            // =================================

            if (editingStudentId !== null) {

                response = await fetch(
                    `${API_URL}/${editingStudentId}`,
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


            // =================================
            // ADD NEW STUDENT
            // =================================

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


            // Convert response
            const data =
                await response.json();


            // If API returns an error
            if (!response.ok) {

                throw new Error(
                    data.message
                );

            }


            // Show success message
            showMessage(data.message);


            // Reset form
            resetForm();


            // Reload students
            fetchStudents();


        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Something went wrong."
            );

        }

    }
);


// ========================================
// EDIT STUDENT
// ========================================

function editStudent(student) {

    // Store student ID
    editingStudentId = student.id;


    // Put existing data into inputs
    nameInput.value = student.name;

    ageInput.value = student.age;

    courseInput.value = student.course;


    // Change form title
    formTitle.textContent =
        "Edit Student";


    // Change button text
    submitButton.textContent =
        "Update Student";


    // Show cancel button
    cancelButton.hidden = false;


    // Scroll to form
    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ========================================
// DELETE STUDENT
// ========================================

async function deleteStudent(id) {

    // Ask for confirmation
    const confirmed =
        confirm(
            "Are you sure you want to delete this student?"
        );


    // Stop if user cancels
    if (!confirmed) {

        return;

    }


    try {

        // Send DELETE request
        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        // Convert response
        const data =
            await response.json();


        // Handle API error
        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        // Show success message
        showMessage(data.message);


        // Reload students
        fetchStudents();


    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Unable to delete student."
        );

    }

}


// ========================================
// RESET FORM
// ========================================

function resetForm() {

    // Clear input values
    studentForm.reset();


    // Exit edit mode
    editingStudentId = null;


    // Restore title
    formTitle.textContent =
        "Add Student";


    // Restore button text
    submitButton.textContent =
        "Add Student";


    // Hide cancel button
    cancelButton.hidden = true;

}


// ========================================
// CANCEL EDIT
// ========================================

cancelButton.addEventListener(
    "click",
    resetForm
);


// ========================================
// REFRESH BUTTON
// ========================================

refreshButton.addEventListener(
    "click",
    fetchStudents
);


// ========================================
// LOAD STUDENTS WHEN PAGE OPENS
// ========================================

fetchStudents();