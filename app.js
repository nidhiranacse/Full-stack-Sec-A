const API = "/students";
const $ = (id) => document.getElementById(id);
const form = $("student-form");
const FIELDS = ["name", "rollNo", "course", "marks"];

function showMessage(text, isError = false) {
  const m = $("message");
  m.textContent = text;
  m.className = isError ? "error" : "success";
}

// ---------- client-side validation ----------
function validate() {
  const errs = {};
  if ($("name").value.trim().length < 2) errs.name = "Name is required (min 2 chars)";
  if (!$("rollNo").value.trim()) errs.rollNo = "Roll No. is required";
  if (!$("course").value.trim()) errs.course = "Course is required";
  const marks = $("marks").value;
  if (marks === "" || isNaN(marks) || marks < 0 || marks > 100) errs.marks = "Marks must be between 0 and 100";
  FIELDS.forEach((f) => ($("err-" + f).textContent = errs[f] || ""));
  return Object.keys(errs).length === 0;
}

// ---------- API helper ----------
async function api(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---------- render ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadStudents() {
  try {
    const students = await api(API);
    $("student-body").innerHTML = students.length
      ? students.map((s) => `
        <tr>
          <td>${esc(s.name)}</td><td>${esc(s.rollNo)}</td><td>${esc(s.course)}</td><td>${s.marks}</td>
          <td>
            <button class="small" onclick="editStudent('${s._id}')">Edit</button>
            <button class="small danger" onclick="deleteStudent('${s._id}')">Delete</button>
          </td>
        </tr>`).join("")
      : `<tr><td colspan="5">No students yet.</td></tr>`;
  } catch (err) { showMessage(err.message, true); }
}

// ---------- create / update ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;
  const id = $("student-id").value;
  const body = JSON.stringify({
    name: $("name").value.trim(), rollNo: $("rollNo").value.trim(),
    course: $("course").value.trim(), marks: Number($("marks").value),
  });
  try {
    await api(id ? `${API}/${id}` : API, { method: id ? "PUT" : "POST", body });
    showMessage(id ? "Student updated" : "Student added");
    resetForm();
    loadStudents();
  } catch (err) { showMessage(err.message, true); }
});

async function editStudent(id) {
  try {
    const s = await api(`${API}/${id}`);
    $("student-id").value = s._id;
    FIELDS.forEach((f) => ($(f).value = s[f]));
    $("form-title").textContent = "Edit Student";
    $("submit-btn").textContent = "Update Student";
    $("cancel-btn").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) { showMessage(err.message, true); }
}

async function deleteStudent(id) {
  if (!confirm("Delete this student record?")) return;
  try {
    await api(`${API}/${id}`, { method: "DELETE" });
    showMessage("Student deleted");
    loadStudents();
  } catch (err) { showMessage(err.message, true); }
}

function resetForm() {
  form.reset();
  $("student-id").value = "";
  $("form-title").textContent = "Add Student";
  $("submit-btn").textContent = "Add Student";
  $("cancel-btn").hidden = true;
  FIELDS.forEach((f) => ($("err-" + f).textContent = ""));
}
$("cancel-btn").addEventListener("click", resetForm);

loadStudents();
