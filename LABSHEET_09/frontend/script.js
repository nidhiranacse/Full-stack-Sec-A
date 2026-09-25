const API_URL = "http://localhost:5000/students";

const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");

let editingId = null;

// Client-side validation
function validateForm(name, rollNo, course, marks) {
  if (!name.trim() || !rollNo.trim() || !course.trim()) {
    return "Name, Roll No. and Course are required.";
  }

  if (marks === "" || isNaN(marks) || marks < 0 || marks > 100) {
    return "Marks must be a number between 0 and 100.";
  }

  return null;
}

// Fetch and render all students
async function loadStudents() {
  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    if (result.success) {
      renderTable(result.data);
    }
  } catch (err) {
    console.error("Error fetching students:", err);
  }
}

function renderTable(students) {
  tableBody.innerHTML = "";

  students.forEach((s) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.rollNo}</td>
      <td>${s.course}</td>
      <td>${s.marks}</td>
      <td>
        <button class="edit-btn" onclick="editStudent('${s._id}')">
          Edit
        </button>
        <button class="delete-btn" onclick="deleteStudent('${s._id}')">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Create / Update student
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const rollNo = document.getElementById("rollNo").value;
  const course = document.getElementById("course").value;
  const marks = document.getElementById("marks").value;

  const errorMsg = validateForm(name, rollNo, course, marks);

  if (errorMsg) {
    formError.textContent = errorMsg;
    return;
  }

  formError.textContent = "";

  const payload = {
    name,
    rollNo,
    course,
    marks: Number(marks),
  };

  try {
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      editingId = null;
      submitBtn.textContent = "Add Student";
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    form.reset();
    loadStudents();
  } catch (err) {
    console.error("Error saving student:", err);
  }
});

// Edit student
window.editStudent = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();

    if (!result.success) return;

    const s = result.data;

    document.getElementById("name").value = s.name;
    document.getElementById("rollNo").value = s.rollNo;
    document.getElementById("course").value = s.course;
    document.getElementById("marks").value = s.marks;

    editingId = id;
    submitBtn.textContent = "Update Student";
  } catch (err) {
    console.error("Error loading student:", err);
  }
};

// Delete student
window.deleteStudent = async (id) => {
  if (!confirm("Delete this student record?")) {
    return;
  }

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    loadStudents();
  } catch (err) {
    console.error("Error deleting student:", err);
  }
};

// Initial load
loadStudents();
