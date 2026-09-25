const API_URL = 'http://localhost:5000/students';

const form = document.getElementById('studentForm');
const tbody = document.querySelector('#studentTable tbody');


// ============================================================
// LOAD ALL STUDENTS
// ============================================================

async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        const text = await response.text();

        if (!response.ok) {
            throw new Error(
                `Server error ${response.status}: ${text}`
            );
        }

        const students = JSON.parse(text);

        tbody.innerHTML = '';

        students.forEach((student) => {
            tbody.innerHTML += `
                <tr>
                    <td>${student.name}</td>

                    <td>${student.rollNo}</td>

                    <td>${student.course}</td>

                    <td>${student.marks}</td>

                    <td>
                        <button
                            class="action-button edit-button"
                            onclick="editStudent('${student._id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="action-button delete-button"
                            onclick="deleteStudent('${student._id}')"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Load error:', error);

        alert(
            'Unable to load student records.\n\n' +
            error.message
        );
    }
}


// ============================================================
// ADD / UPDATE STUDENT
// ============================================================

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('studentId').value;

    const marks = Number(
        document.getElementById('marks').value
    );


    // Validate marks
    if (marks < 0 || marks > 100) {
        alert('Marks must be between 0 and 100.');
        return;
    }


    const payload = {
        name: document
            .getElementById('name')
            .value
            .trim(),

        rollNo: document
            .getElementById('rollNo')
            .value
            .trim(),

        course: document
            .getElementById('course')
            .value
            .trim(),

        marks: marks
    };


    try {
        const url = id
            ? `${API_URL}/${id}`
            : API_URL;

        const method = id
            ? 'PUT'
            : 'POST';


        const response = await fetch(url, {
            method: method,

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(payload)
        });


        // Read response as text first
        const text = await response.text();

        console.log('Server response:', text);


        // Check for server error
        if (!response.ok) {
            throw new Error(
                `Server error ${response.status}: ${text}`
            );
        }


        // Convert response to JSON
        const data = JSON.parse(text);


        alert(
            id
                ? 'Student updated successfully.'
                : 'Student added successfully.'
        );


        // Clear form
        form.reset();

        document.getElementById('studentId').value = '';


        // Reload students
        loadStudents();


    } catch (error) {
        console.error('Save error:', error);

        alert(
            'Unable to save student.\n\n' +
            error.message
        );
    }
});


// ============================================================
// EDIT STUDENT
// ============================================================

async function editStudent(id) {
    try {
        const response = await fetch(
            `${API_URL}/${id}`
        );


        const text = await response.text();


        if (!response.ok) {
            throw new Error(
                `Server error ${response.status}: ${text}`
            );
        }


        const student = JSON.parse(text);


        document.getElementById('studentId').value =
            student._id;

        document.getElementById('name').value =
            student.name;

        document.getElementById('rollNo').value =
            student.rollNo;

        document.getElementById('course').value =
            student.course;

        document.getElementById('marks').value =
            student.marks;


        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });


    } catch (error) {
        console.error('Edit error:', error);

        alert(
            'Unable to load student.\n\n' +
            error.message
        );
    }
}


// ============================================================
// DELETE STUDENT
// ============================================================

async function deleteStudent(id) {

    const confirmed = confirm(
        'Delete this student record?'
    );


    if (!confirmed) {
        return;
    }


    try {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: 'DELETE'
            }
        );


        const text = await response.text();


        if (!response.ok) {
            throw new Error(
                `Server error ${response.status}: ${text}`
            );
        }


        const data = JSON.parse(text);


        alert(
            data.message ||
            'Student deleted successfully.'
        );


        loadStudents();


    } catch (error) {
        console.error('Delete error:', error);

        alert(
            'Unable to delete student.\n\n' +
            error.message
        );
    }
}


// ============================================================
// INITIAL LOAD
// ============================================================

loadStudents();