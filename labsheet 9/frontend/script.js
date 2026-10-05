const API_URL = "http://localhost:5000/students";
const form = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
let editStudentId = null;

// Load Students
async function loadStudents() {
try {
    const response = await fetch(API_URL);
    const students = await response.json();
    studentTable.innerHTML = "";
    students.forEach((student) => {
        studentTable.innerHTML += `
            <tr>
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
            </tr>
        `;
    });
} catch (error) {
    console.log(error);
}
}
// Add or Update Student
form.addEventListener("submit", async (event) => {
event.preventDefault();
const name = document.getElementById("name").value;
const rollNo = document.getElementById("rollNo").value;
const course = document.getElementById("course").value;
const marks = document.getElementById("marks").value;

// Validation
if (!rollNo) {
    alert("Roll Number is required");
    return;
}

if (marks < 0 || marks > 100) {
    alert("Marks must be between 0 and 100");
    return;
}

const studentData = {
    name,
    rollNo,
    course,
    marks
};

try {
    if (editStudentId) {
        await fetch(`${API_URL}/${editStudentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        editStudentId = null;
        form.querySelector("button").textContent = "Add Student";

    } else {
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });
    }
    form.reset();
    loadStudents();

} catch (error) {
    console.log(error);

}
});

// Delete Student
async function deleteStudent(id) {
const confirmDelete = confirm(
    "Are you sure you want to delete this student?"
);

if (!confirmDelete) {
    return;
}
await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
});
loadStudents();
}

// Edit Student
async function editStudent(id) {
const response = await fetch(`${API_URL}/${id}`);
const student = await response.json();
document.getElementById("name").value = student.name;
document.getElementById("rollNo").value = student.rollNo;
document.getElementById("course").value = student.course;
document.getElementById("marks").value = student.marks;
editStudentId = id;
form.querySelector("button").textContent =
    "Update Student";
}
// Load Students When Page Opens
loadStudents();
