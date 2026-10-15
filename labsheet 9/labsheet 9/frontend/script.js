// Base URL of the backend REST API
const API_URL = "http://localhost:5000/students";

const form = document.getElementById("studentForm");
const tableBody = document.querySelector("#studentTable tbody");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const studentIdField = document.getElementById("studentId");

// Load all students as soon as the page opens
document.addEventListener("DOMContentLoaded", fetchStudents);

// --- READ: fetch all students and render the table ---
async function fetchStudents() {
  try {
    const res = await fetch(API_URL);
    const students = await res.json();
    renderTable(students);
  } catch (err) {
    formError.textContent = "Could not reach the server. Is the backend running?";
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
        <button class="edit-btn" onclick="editStudent('${s._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteStudent('${s._id}')">Delete</button>
      </td>`;
    tableBody.appendChild(row);
  });
}

// --- CREATE / UPDATE: form submit handler ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";

  const payload = {
    name: document.getElementById("name").value.trim(),
    rollNo: document.getElementById("rollNo").value.trim(),
    course: document.getElementById("course").value.trim(),
    marks: Number(document.getElementById("marks").value),
  };

  // --- Client-side validation ---
  if (!payload.rollNo) {
    formError.textContent = "Roll No. is required.";
    return;
  }
  if (payload.marks < 0 || payload.marks > 100) {
    formError.textContent = "Marks must be between 0 and 100.";
    return;
  }

  const id = studentIdField.value;

  try {
    let res;
    if (id) {
      // UPDATE existing student
      res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // CREATE new student
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Something went wrong");
    }

    resetForm();
    fetchStudents();
  } catch (err) {
    formError.textContent = err.message;
  }
});

// --- Populate the form for editing ---
async function editStudent(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const s = await res.json();

  studentIdField.value = s._id;
  document.getElementById("name").value = s.name;
  document.getElementById("rollNo").value = s.rollNo;
  document.getElementById("course").value = s.course;
  document.getElementById("marks").value = s.marks;

  submitBtn.textContent = "Update Student";
  cancelBtn.style.display = "inline-block";
}

// --- DELETE ---
async function deleteStudent(id) {
  if (!confirm("Delete this student record?")) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchStudents();
}

// --- Cancel edit mode ---
cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  studentIdField.value = "";
  submitBtn.textContent = "Add Student";
  cancelBtn.style.display = "none";
  formError.textContent = "";
}
