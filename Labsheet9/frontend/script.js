const API_URL = "http://localhost:5000/students";

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");

const nameInput = document.getElementById("name");
const rollNoInput = document.getElementById("rollNo");
const courseInput = document.getElementById("course");
const marksInput = document.getElementById("marks");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

let editId = null;

async function getStudent(){
    try{
        const response=await fetch(API_URL);
        const students=await response.json();
        studentTable.innerHTML="";
        students.forEach((student)=>{
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.rollNo}</td>
                <td>${student.course}</td>
                <td>${student.marks}</td>
                <td>
                    <button
                        class="edit-button"
                        onclick="editStudent('${student._id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteStudent('${student._id}')"
                    >
                        Delete
                    </button>
                </td>
            `;
            studentTable.appendChild(row);
        });
    }catch(error){
            console.error("Error:",error);
            alert("Could not load students");
    }
}
// CREATE / UPDATE
studentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = nameInput.value.trim();
    const rollNo = rollNoInput.value.trim();
    const course = courseInput.value.trim();
    const marks = Number(marksInput.value);

    // Basic validation
    if (!name || !rollNo || !course) {
        alert("Please fill all fields");
        return;
    }

    if (marks < 0 || marks > 100) {
        alert("Marks must be between 0 and 100");
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

        if (editId === null) {

            // CREATE
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(studentData)
            });

        } else {

            // UPDATE
            response = await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(studentData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Something went wrong");
            return;
        }

        alert(
            editId === null
                ? "Student added successfully"
                : "Student updated successfully"
        );

        studentForm.reset();

        editId = null;

        submitButton.textContent = "Add Student";
        cancelButton.style.display = "none";

        getStudents();

    } catch (error) {
        console.error("Error:", error);
        alert("Server error");
    }
});


// EDIT - Get one student
async function editStudent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        const student = await response.json();

        if (!response.ok) {
            alert(student.message);
            return;
        }

        nameInput.value = student.name;
        rollNoInput.value = student.rollNo;
        courseInput.value = student.course;
        marksInput.value = student.marks;

        editId = id;

        submitButton.textContent = "Update Student";
        cancelButton.style.display = "block";

    } catch (error) {
        console.error("Error:", error);
        alert("Could not load student");
    }
}


// DELETE
async function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        alert("Student deleted successfully");

        getStudents();

    } catch (error) {
        console.error("Error:", error);
        alert("Could not delete student");
    }
}


// Cancel edit
function cancelEdit() {

    studentForm.reset();

    editId = null;

    submitButton.textContent = "Add Student";
    cancelButton.style.display = "none";
}


// Load students when page opens
getStudents();