const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const nameInput = document.getElementById("name");
const rollNoInput = document.getElementById("rollNo");
const courseInput = document.getElementById("course");
const marksInput = document.getElementById("marks");
const studentIdInput = document.getElementById("studentId");
const submitBtn = document.getElementById("submitBtn");

async function loadStudents() {
    const response = await fetch("/students");
    const students = await response.json();
    table.innerHTML = "";
    students.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.rollNo}</td>
            <td>${student.course}</td>
            <td>${student.marks}</td>
            <td>
                <button class="edit"
                    onclick="editStudent('${student._id}')">
                    Edit
                </button>

                <button class="delete"
                    onclick="deleteStudent('${student._id}')">
                    Delete
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}
form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const name = nameInput.value.trim();
    const rollNo = rollNoInput.value.trim();
    const course = courseInput.value.trim();
    const marks = Number(marksInput.value);
    if (!name || !rollNo || !course) {
        alert("Please fill all fields.");
        return;
    }
    if (marks < 0 || marks > 100) {
        alert("Marks must be between 0 and 100.");
        return;
    }
    const student = {
        name,
        rollNo,
        course,
        marks
    };
    let url = "/students";
    let method = "POST";
    if (studentIdInput.value) {
        url = `/students/${studentIdInput.value}`;
        method = "PUT";
    }
    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
    });
    const data = await response.json();

    if (!response.ok) {
        alert(data.error || data.message);
        return;
    }
    form.reset();
    studentIdInput.value = "";
    submitBtn.textContent = "Add Student";
    loadStudents();
});
async function editStudent(id) {
    const response = await fetch(`/students/${id}`);
    const student = await response.json();
    studentIdInput.value = student._id;
    nameInput.value = student.name;
    rollNoInput.value = student.rollNo;
    courseInput.value = student.course;
    marksInput.value = student.marks;
    submitBtn.textContent = "Update Student";
}
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }
    await fetch(`/students/${id}`, {
        method: "DELETE"
    });
    loadStudents();
}
loadStudents();