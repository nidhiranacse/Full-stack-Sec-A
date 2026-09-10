/**
 * app.js — Student Record Management System Frontend
 * Lab Sheet 9 | Shashwat Saini | CU24250052
 *
 * Uses fetch API with async/await to communicate with
 * the Node.js + Express + MongoDB REST API backend.
 */

'use strict';

// ── Configuration ──────────────────────────────────────────
const API_BASE = 'http://localhost:5000/students';

// ── State ──────────────────────────────────────────────────
let allStudents = [];       // Master list from API
let deleteTargetId = null;  // ID of student pending deletion
let isEditing = false;      // Are we in edit mode?

// ── DOM References ─────────────────────────────────────────
const form          = document.getElementById('student-form');
const editIdInput   = document.getElementById('edit-id');
const nameInput     = document.getElementById('name');
const rollNoInput   = document.getElementById('rollNo');
const courseSelect  = document.getElementById('course');
const marksInput    = document.getElementById('marks');
const submitBtn     = document.getElementById('submit-btn');
const submitText    = document.getElementById('submit-text');
const btnLoader     = document.getElementById('btn-loader');
const resetBtn      = document.getElementById('reset-btn');
const formHeading   = document.getElementById('form-heading');
const toast         = document.getElementById('toast');
const searchInput   = document.getElementById('search-input');
const refreshBtn    = document.getElementById('refresh-btn');
const loadingState  = document.getElementById('loading-state');
const emptyState    = document.getElementById('empty-state');
const tableWrap     = document.getElementById('table-wrap');
const tbody         = document.getElementById('records-tbody');
const modalOverlay  = document.getElementById('modal-overlay');
const modalBody     = document.getElementById('modal-body');
const modalConfirm  = document.getElementById('modal-confirm');
const modalCancel   = document.getElementById('modal-cancel');
const marksBar      = document.getElementById('marks-bar');
const marksPreview  = document.getElementById('marks-preview');

// Stat elements
const totalCount    = document.getElementById('total-count');
const avgMarks      = document.getElementById('avg-marks');
const topMarks      = document.getElementById('top-marks');
const passCount     = document.getElementById('pass-count');

// Connection badge
const connBadge     = document.getElementById('connection-badge');
const connStatus    = document.getElementById('connection-status');

// ═══════════════════════════════════════════════════════════
//  INITIALISATION
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
  bindEvents();
});

// ═══════════════════════════════════════════════════════════
//  EVENT BINDINGS
// ═══════════════════════════════════════════════════════════
function bindEvents() {
  form.addEventListener('submit', handleFormSubmit);
  resetBtn.addEventListener('click', resetForm);
  refreshBtn.addEventListener('click', () => fetchStudents(true));
  searchInput.addEventListener('input', handleSearch);
  marksInput.addEventListener('input', updateMarksBar);
  modalCancel.addEventListener('click', closeModal);
  modalConfirm.addEventListener('click', confirmDelete);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ═══════════════════════════════════════════════════════════
//  API HELPERS
// ═══════════════════════════════════════════════════════════

/** Generic fetch wrapper with error handling */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ── GET all students ────────────────────────────────────────
async function fetchStudents(showSpinRefresh = false) {
  try {
    if (showSpinRefresh) {
      refreshBtn.classList.add('spinning');
    } else {
      showLoading();
    }
    setConnectionState('connecting');

    const data = await apiFetch(API_BASE);
    allStudents = data.data || [];
    setConnectionState('connected');
    renderTable(allStudents);
    updateStats(allStudents);
  } catch (err) {
    setConnectionState('error');
    showToast('❌ Cannot reach server. Is backend running on port 5000?', 'error');
    showEmpty();
    console.error('Fetch error:', err);
  } finally {
    refreshBtn.classList.remove('spinning');
  }
}

// ── POST / PUT student ──────────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    name:   nameInput.value.trim(),
    rollNo: rollNoInput.value.trim(),
    course: courseSelect.value,
    marks:  Number(marksInput.value),
  };

  setSubmitLoading(true);

  try {
    if (isEditing) {
      // PUT (update)
      await apiFetch(`${API_BASE}/${editIdInput.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('✅ Student updated successfully!', 'success');
    } else {
      // POST (create)
      await apiFetch(API_BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('✅ Student added successfully!', 'success');
    }
    resetForm();
    await fetchStudents();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  } finally {
    setSubmitLoading(false);
  }
}

// ── DELETE student ──────────────────────────────────────────
function openDeleteModal(id, name) {
  deleteTargetId = id;
  modalBody.textContent = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
  modalOverlay.style.display = 'flex';
}

function closeModal() {
  modalOverlay.style.display = 'none';
  deleteTargetId = null;
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  try {
    await apiFetch(`${API_BASE}/${deleteTargetId}`, { method: 'DELETE' });
    closeModal();
    showToast('🗑️ Student deleted successfully!', 'success');
    await fetchStudents();
  } catch (err) {
    closeModal();
    showToast(`❌ ${err.message}`, 'error');
  }
}

// ── GET one student (populate edit form) ───────────────────
async function editStudent(id) {
  try {
    const data = await apiFetch(`${API_BASE}/${id}`);
    const s = data.data;
    editIdInput.value   = s._id;
    nameInput.value     = s.name;
    rollNoInput.value   = s.rollNo;
    courseSelect.value  = s.course;
    marksInput.value    = s.marks;
    updateMarksBar();

    isEditing = true;
    formHeading.textContent = 'Edit Student';
    submitText.textContent  = 'Update Student';
    submitBtn.querySelector('.btn-icon').textContent = '✎';
    resetBtn.style.display  = 'inline-flex';
    clearErrors();

    // Smooth scroll to form on mobile
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
//  FORM VALIDATION (Client-side)
// ═══════════════════════════════════════════════════════════
function validateForm() {
  let valid = true;
  clearErrors();

  const name   = nameInput.value.trim();
  const rollNo = rollNoInput.value.trim();
  const course = courseSelect.value;
  const marks  = marksInput.value;

  if (!name) {
    setError('name', 'Full name is required.');
    valid = false;
  } else if (name.length < 2) {
    setError('name', 'Name must be at least 2 characters.');
    valid = false;
  }

  if (!rollNo) {
    setError('rollNo', 'Roll number is required.');
    valid = false;
  } else if (!/^[A-Za-z0-9]+$/.test(rollNo)) {
    setError('rollNo', 'Roll number must be alphanumeric.');
    valid = false;
  }

  if (!course) {
    setError('course', 'Please select a course.');
    valid = false;
  }

  if (marks === '' || marks === null || marks === undefined) {
    setError('marks', 'Marks are required.');
    valid = false;
  } else if (Number(marks) < 0 || Number(marks) > 100) {
    setError('marks', 'Marks must be between 0 and 100.');
    valid = false;
  }

  return valid;
}

function setError(field, msg) {
  const el = document.getElementById(`${field}-error`);
  const input = document.getElementById(field);
  if (el) el.textContent = msg;
  if (input) input.classList.add('invalid');
}

function clearErrors() {
  ['name', 'rollNo', 'course', 'marks'].forEach((f) => {
    const el = document.getElementById(`${f}-error`);
    const input = document.getElementById(f);
    if (el) el.textContent = '';
    if (input) input.classList.remove('invalid');
  });
}

// ═══════════════════════════════════════════════════════════
//  TABLE RENDERING
// ═══════════════════════════════════════════════════════════
function renderTable(students) {
  if (!students || students.length === 0) {
    showEmpty();
    return;
  }

  tbody.innerHTML = '';
  students.forEach((s, idx) => {
    const delay = idx * 0.04;
    const row = document.createElement('tr');
    row.style.animationDelay = `${delay}s`;
    row.innerHTML = `
      <td class="row-num">${idx + 1}</td>
      <td class="name-cell">${escapeHtml(s.name)}</td>
      <td class="roll-cell">${escapeHtml(s.rollNo)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td class="marks-cell">
        <div class="marks-cell-inner">
          <span class="marks-num">${s.marks}</span>
          <div class="marks-mini-bar">
            <div class="marks-mini-fill" style="width:${s.marks}%"></div>
          </div>
        </div>
      </td>
      <td>
        <span class="grade-badge grade-${s.grade.replace('+', 'p')}">${s.grade}</span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" id="edit-${s._id}" onclick="editStudent('${s._id}')" aria-label="Edit ${escapeHtml(s.name)}">
            ✎ Edit
          </button>
          <button class="btn-del" id="del-${s._id}" onclick="openDeleteModal('${s._id}', '${escapeHtml(s.name)}')" aria-label="Delete ${escapeHtml(s.name)}">
            🗑 Del
          </button>
        </div>
      </td>`;
    tbody.appendChild(row);
  });

  tableWrap.style.display = 'block';
  loadingState.style.display = 'none';
  emptyState.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════
function handleSearch() {
  const q = searchInput.value.toLowerCase();
  if (!q) {
    renderTable(allStudents);
    updateStats(allStudents);
    return;
  }
  const filtered = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      String(s.marks).includes(q)
  );
  renderTable(filtered);
  updateStats(filtered);
}

// ═══════════════════════════════════════════════════════════
//  STATS
// ═══════════════════════════════════════════════════════════
function updateStats(students) {
  totalCount.textContent = students.length;
  if (students.length === 0) {
    avgMarks.textContent = '—';
    topMarks.textContent = '—';
    passCount.textContent = 0;
    return;
  }
  const marks = students.map((s) => s.marks);
  const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
  avgMarks.textContent  = avg.toFixed(1);
  topMarks.textContent  = Math.max(...marks);
  passCount.textContent = students.filter((s) => s.marks >= 40).length;
}

// ═══════════════════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════════════════
function showLoading() {
  loadingState.style.display = 'flex';
  emptyState.style.display   = 'none';
  tableWrap.style.display    = 'none';
}
function showEmpty() {
  loadingState.style.display = 'none';
  emptyState.style.display   = 'flex';
  tableWrap.style.display    = 'none';
}
function setSubmitLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.classList.toggle('loading', loading);
}
function resetForm() {
  form.reset();
  editIdInput.value = '';
  isEditing = false;
  formHeading.textContent = 'Add New Student';
  submitText.textContent  = 'Add Student';
  submitBtn.querySelector('.btn-icon').textContent = '✚';
  resetBtn.style.display  = 'none';
  clearErrors();
  updateMarksBar();
}

let toastTimer = null;
function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className   = `toast ${type}`;
  toast.style.display = 'block';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

function setConnectionState(state) {
  connBadge.className = `badge ${state}`;
  const labels = { connecting: 'Connecting…', connected: 'Connected', error: 'Offline' };
  connStatus.textContent = labels[state] || state;
}

function updateMarksBar() {
  const val = Number(marksInput.value);
  if (isNaN(val) || marksInput.value === '') {
    marksBar.style.width = '0%';
    marksPreview.textContent = '';
    return;
  }
  const pct = Math.min(100, Math.max(0, val));
  marksBar.style.width = `${pct}%`;
  marksPreview.textContent = getGradeLabel(val);
}

function getGradeLabel(marks) {
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 40) return 'C';
  return 'F';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Expose to HTML onclick handlers
window.editStudent       = editStudent;
window.openDeleteModal   = openDeleteModal;
