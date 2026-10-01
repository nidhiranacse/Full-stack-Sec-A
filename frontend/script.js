const API_URL = "http://localhost:5000/students";
const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
// fetch and display all students
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        studentTableBody.innerHTML = "";
        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.rollNo}</td>
                <td>${student.course}</td>
                <td>${student.marks}</td>
                <td>
                <button class="action-btn" onclick="editStudent(${student.id})">Edit</button>
                <button class="action-btn" onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            `;
            studentTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}
// add a new student
studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const rollNo = document.getElementById("rollNo").value.trim();
    const course = document.getElementById("course").value.trim();
    const marks = Number(document.getElementById("marks").value);
    if (!name || !rollNo || !course) {
        alert("Please fill all required fields.");
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
                name,
                rollNo,
                course,
                marks,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.error || "Failed to add student.");
            return;
        }
        alert("Student added successfully!");
        studentForm.reset();
        loadStudents();
    } catch (error) {
        console.error("Error adding student:",error);
        alert("Unable to connect to the server.")
    }
});
// Delete a student
async function deleteStudent(id) {
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) {
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${id}`,{
            method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.error || "Failed to delete student.");
            return;
        }
        alert(data.message);
        loadStudents();
    } catch (error) {
        console.error("Error deleting student:",error);
    }
}
// edit a student
async function editStudent(id) {
    const name = prompt("Enter new student name:");
    if (name === null) return;
    const rollNo = prompt("Enter new roll number:");
    if(rollNo === null) return;
    const course = prompt("Enter new course:");
    if(course === null) return;
    const marks = Number(prompt("Enter new marks (0-100):"));
    if (marks < 0 || marks >100 || isNaN(marks)) {
        alert("Marks must be between 0 and 100.");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                rollNo,
                course,
                marks,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.error || "Failed to update student.");
            return;
        }
        alert("Student updated successfully!");
        loadStudents();
    } catch (error) {
        console.error("Error updating student:",error);
    }
}
// load students when page opens
loadStudents();