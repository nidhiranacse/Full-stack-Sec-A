/**
 * Frontend JavaScript Client for Student Management API
 * Student: Pulkit Goyal | CUID: CU24250263 | Roll 40 | Section A
 */

const API_BASE = 'http://localhost:5000/api/students';

// Fallback local memory state for seamless demonstration without live Mongo
let localStudents = [
  {
    _id: '1',
    name: 'Pulkit Goyal',
    cuid: 'CU24250263',
    rollNumber: 40,
    email: 'pulkitgoyal0103@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    marks: 96
  },
  {
    _id: '2',
    name: 'Aarav Sharma',
    cuid: 'CU24250264',
    rollNumber: 41,
    email: 'aarav.sharma@example.com',
    course: 'B.Tech Computer Science & Engineering',
    marks: 89
  },
  {
    _id: '3',
    name: 'Ananya Patel',
    cuid: 'CU24250265',
    rollNumber: 42,
    email: 'ananya.patel@example.com',
    course: 'B.Tech Computer Science & Engineering',
    marks: 92
  }
];

// DOM Element References
const form = document.getElementById('studentForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const tableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const studentCount = document.getElementById('studentCount');
const alertBox = document.getElementById('alertBox');

// State tracking
let editingId = null;

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();

  form.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', resetForm);
  searchInput.addEventListener('input', (e) => fetchStudents(e.target.value));
});

function showAlert(message, isError = false) {
  alertBox.textContent = message;
  alertBox.className = `alert-box ${isError ? 'alert-error' : 'alert-success'}`;
  alertBox.classList.remove('hidden');
  setTimeout(() => alertBox.classList.add('hidden'), 4000);
}

// Fetch Students (attempts API first, falls back gracefully to local array)
async function fetchStudents(searchQuery = '') {
  try {
    const url = searchQuery ? `${API_BASE}?search=${encodeURIComponent(searchQuery)}` : API_BASE;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      renderTable(data.data);
      return;
    }
  } catch {
    // API server offline; use local fallback
  }

  // Fallback filtering
  const filtered = localStudents.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
           s.cuid.toLowerCase().includes(q) ||
           s.email.toLowerCase().includes(q);
  });
  renderTable(filtered);
}

function renderTable(students) {
  tableBody.innerHTML = '';
  studentCount.textContent = `Total Registered: ${students.length}`;

  if (students.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:24px;">No students found matching query.</td></tr>`;
    return;
  }

  students.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.rollNumber}</strong></td>
      <td>${s.name}</td>
      <td><code>${s.cuid}</code></td>
      <td>${s.email}</td>
      <td><span style="font-weight:600; color:${s.marks >= 90 ? '#10b981' : '#0284c7'}">${s.marks}%</span></td>
      <td>
        <button class="btn-sm btn-edit" onclick="startEdit('${s._id}')">Edit</button>
        <button class="btn-sm btn-delete" onclick="deleteStudent('${s._id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Handle Form Submission (Create or Update)
async function handleFormSubmit(e) {
  e.preventDefault();

  const payload = {
    name: document.getElementById('name').value.trim(),
    cuid: document.getElementById('cuid').value.trim().toUpperCase(),
    rollNumber: Number(document.getElementById('rollNumber').value),
    email: document.getElementById('email').value.trim().toLowerCase(),
    course: document.getElementById('course').value.trim(),
    marks: Number(document.getElementById('marks').value)
  };

  try {
    if (editingId) {
      // Update
      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showAlert('✓ Student updated successfully via API');
        resetForm();
        fetchStudents();
        return;
      }
    } else {
      // Create
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showAlert('✓ New student registered successfully via API');
        resetForm();
        fetchStudents();
        return;
      }
    }
  } catch {
    // Local fallback update
  }

  if (editingId) {
    const index = localStudents.findIndex((s) => s._id === editingId);
    if (index !== -1) {
      localStudents[index] = { ...payload, _id: editingId };
      showAlert(`✓ Updated record for ${payload.name}`);
    }
  } else {
    const newStudent = { ...payload, _id: Date.now().toString() };
    localStudents.push(newStudent);
    showAlert(`✓ Registered new record for ${payload.name}`);
  }

  resetForm();
  fetchStudents(searchInput.value);
}

// Edit Mode
window.startEdit = function (id) {
  const student = localStudents.find((s) => s._id === id);
  if (!student) return;

  editingId = id;
  document.getElementById('studentId').value = id;
  document.getElementById('name').value = student.name;
  document.getElementById('cuid').value = student.cuid;
  document.getElementById('rollNumber').value = student.rollNumber;
  document.getElementById('email').value = student.email;
  document.getElementById('course').value = student.course;
  document.getElementById('marks').value = student.marks;

  formTitle.textContent = `Edit Student: ${student.name}`;
  submitBtn.textContent = 'Update Student';
  cancelBtn.classList.remove('hidden');
};

// Cancel Edit
function resetForm() {
  editingId = null;
  form.reset();
  document.getElementById('studentId').value = '';
  document.getElementById('course').value = 'B.Tech Computer Science & Engineering';
  formTitle.textContent = 'Register New Student';
  submitBtn.textContent = 'Save Student';
  cancelBtn.classList.add('hidden');
}

// Delete Student
window.deleteStudent = async function (id) {
  if (!confirm('Are you sure you want to delete this student record?')) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showAlert('✓ Student removed via API');
      fetchStudents();
      return;
    }
  } catch {
    // fallback
  }

  localStudents = localStudents.filter((s) => s._id !== id);
  showAlert('✓ Student removed successfully');
  fetchStudents(searchInput.value);
};
