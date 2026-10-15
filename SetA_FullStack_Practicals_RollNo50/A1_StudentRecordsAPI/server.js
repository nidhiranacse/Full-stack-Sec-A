
const express = require("express");
const app = express();

app.use(express.json());

let students = [];
let nextId = 1;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Premium Student Management Dashboard
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>StudentHub | Student Management</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

:root{font-family:'DM Sans',sans-serif;color:#eef2ff;background:#080d19}
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(ellipse at 65% 0%,#1a2450 0,transparent 45%),#080d19;min-height:100vh}
button,input{font:inherit}
button{cursor:pointer}
.layout{display:flex;min-height:100vh}
aside{width:245px;flex-shrink:0;padding:28px 18px;background:#0c1221;border-right:1px solid #202b40}
.logo{display:flex;align-items:center;gap:12px;padding:4px 8px 32px;font:700 22px 'Space Grotesk',sans-serif}
.logo-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,#8b5cf6,#4f46e5);font-size:21px}
.nav-label{font-size:11px;letter-spacing:1.8px;color:#78849d;padding:10px 12px}
.nav-item{display:flex;gap:12px;align-items:center;padding:13px 12px;border-radius:11px;color:#9daac2;margin:5px 0}
.nav-item.active{background:#252448;color:#c4b5fd;border:1px solid #393264}
.aside-bottom{margin-top:45px;padding:16px;border:1px solid #273249;border-radius:13px;color:#9daac2;font-size:12px;line-height:1.8}
.dot{display:inline-block;width:8px;height:8px;background:#34d399;border-radius:50%;margin-right:7px}
main{flex:1;min-width:0;padding:34px clamp(18px,4vw,52px);max-width:1600px;margin:0 auto;width:100%}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;border-bottom:1px solid #202b40;padding-bottom:25px}
.eyebrow{color:#9a8df7;font-size:12px;letter-spacing:1.7px;font-weight:700}
h1,h2,p{margin-top:0}
h1{font:700 clamp(26px,3vw,36px) 'Space Grotesk',sans-serif;margin:8px 0}
.muted{color:#8996b0;line-height:1.6}
.avatar{width:42px;height:42px;border-radius:14px;background:#252448;border:1px solid #474078;display:grid;place-items:center;color:#d8d2ff;font-weight:700}
.welcome{display:flex;justify-content:space-between;gap:15px;align-items:center;margin:28px 0}
.welcome p{margin-bottom:0}
.button{border:0;border-radius:10px;padding:12px 17px;background:linear-gradient(110deg,#8b5cf6,#5b63ed);color:white;font-weight:700;box-shadow:0 7px 22px #635bdf30}
.button:hover{filter:brightness(1.12);transform:translateY(-1px)}
.button.secondary{background:#182239;border:1px solid #34415b;box-shadow:none}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:24px 0}
.stat{padding:21px;border:1px solid #26334a;border-radius:16px;background:linear-gradient(145deg,#151e31,#101727)}
.stat-top{display:flex;justify-content:space-between;align-items:center;color:#a4afc5;font-size:13px}
.stat-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#27224a;color:#c4b5fd;font-size:19px}
.stat-number{font:700 32px 'Space Grotesk',sans-serif;margin-top:18px}
.stat-note{font-size:12px;color:#7f8da8;margin-top:5px}
.panel{background:#101827;border:1px solid #26334a;border-radius:17px;margin-top:22px;overflow:hidden}
.panel-head{display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap;padding:23px 23px 18px}
.panel-head h2{font:600 19px 'Space Grotesk',sans-serif;margin:0 0 6px}
.search{width:min(100%,280px);padding:12px 14px;border:1px solid #34415b;border-radius:10px;background:#0b1220;color:#eef2ff;outline:none}
.search:focus,input:focus{border-color:#9182ff;box-shadow:0 0 0 3px #8b5cf626}
.table-wrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;text-align:left;white-space:nowrap}
th{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7f8da8;background:#131e30}
th,td{padding:16px 23px;border-top:1px solid #222f43}
td{font-size:13px;color:#cbd5e1}
.person{display:flex;align-items:center;gap:11px}
.person-icon{display:grid;place-items:center;width:35px;height:35px;border-radius:11px;background:#242448;color:#c4b5fd;font-weight:700}
.person-name{font-weight:700;color:#f1f5f9}
.email{color:#8996b0;font-size:12px;margin-top:4px}
.age-pill{padding:5px 10px;border:1px solid #33415a;border-radius:20px;background:#182338}
.action{background:transparent;border:1px solid #39465c;color:#bac7dd;border-radius:8px;padding:7px 10px;margin-right:5px}
.action.delete{color:#fda4af;border-color:#653345}
.empty{text-align:center;padding:48px 20px;color:#8996b0}
.empty-icon{font-size:32px;margin-bottom:12px}
.footer{color:#65738d;font-size:12px;text-align:center;padding:28px}
.modal-backdrop{position:fixed;inset:0;background:#030712bb;backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;padding:20px;z-index:5}
.modal{width:100%;max-width:470px;background:#111b2d;border:1px solid #34415b;border-radius:19px;padding:28px;box-shadow:0 30px 100px #0008}
.modal h2{font:700 24px 'Space Grotesk',sans-serif;margin-bottom:7px}
.field{margin-top:18px}
.field label{display:block;color:#b9c4d8;font-size:13px;margin-bottom:8px}
.field input{width:100%;padding:12px 13px;border:1px solid #34415b;border-radius:10px;background:#0a1220;color:#f8fafc;outline:none}
.form-actions{display:flex;gap:10px;margin-top:24px}
.form-actions button{flex:1}
.toast{position:fixed;right:24px;bottom:24px;background:#172b2a;border:1px solid #27665b;border-radius:12px;padding:15px 20px;color:#a7f3d0;display:none;z-index:10;box-shadow:0 12px 35px #0005}
@media(max-width:850px){aside{width:75px;padding:22px 10px}.logo{padding:0 6px 28px}.brand,.nav-label,.nav-text,.aside-bottom{display:none}.nav-item{justify-content:center;font-size:20px}.stats{grid-template-columns:1fr}.stat{padding:17px}main{padding:24px 16px}}
@media(max-width:480px){aside{display:none}.welcome{align-items:flex-start;flex-direction:column}.topbar{align-items:flex-start}.panel-head{padding:18px}.search{width:100%}}
</style>
</head>
<body>
<div class="layout">
<aside>
  <div class="logo"><div class="logo-icon">S</div><span class="brand">StudentHub</span></div>
  <div class="nav-label">WORKSPACE</div>
  <div class="nav-item active"><span>▦</span><span class="nav-text">Dashboard</span></div>
  <div class="nav-item"><span>♙</span><span class="nav-text">Students</span></div>
  <div class="nav-label" style="margin-top:26px">SYSTEM</div>
  <div class="nav-item"><span>⌘</span><span class="nav-text">REST API</span></div>
  <div class="aside-bottom"><span class="dot"></span> API server online<br>Node.js + Express.js<br><span style="color:#64748b">In-memory storage</span></div>
</aside>

<main>
  <header class="topbar">
    <div><div class="eyebrow">STUDENT MANAGEMENT</div><h1>Dashboard</h1><div class="muted">Manage your student records in one place.</div></div>
    <div class="avatar">SH</div>
  </header>

  <section class="welcome">
    <div><h2 style="font:600 21px 'Space Grotesk',sans-serif;margin-bottom:7px">Welcome back 👋</h2><p class="muted">Here's what's happening with your records.</p></div>
    <button class="button" onclick="openModal()">＋ Add Student</button>
  </section>

  <section class="stats">
    <div class="stat"><div class="stat-top"><span>Total Students</span><span class="stat-icon">♙</span></div><div class="stat-number" id="total">0</div><div class="stat-note">Records currently stored</div></div>
    <div class="stat"><div class="stat-top"><span>Age 18 and above</span><span class="stat-icon">↗</span></div><div class="stat-number" id="adult">0</div><div class="stat-note">Students aged 18+</div></div>
    <div class="stat"><div class="stat-top"><span>Average Age</span><span class="stat-icon">◷</span></div><div class="stat-number" id="average">—</div><div class="stat-note">Across all student records</div></div>
  </section>

  <section class="panel">
    <div class="panel-head">
      <div><h2>Student Directory</h2><div class="muted" style="font-size:13px">View and manage student information</div></div>
      <input id="search" class="search" placeholder="⌕  Search name or email..." oninput="render()">
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Student</th><th>Student ID</th><th>Age</th><th>Actions</th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
    <div id="empty" class="empty"><div class="empty-icon">♙</div><strong>No students found</strong><p style="margin:8px 0 17px">Add a student to populate your directory.</p><button class="button" onclick="openModal()">＋ Add first student</button></div>
  </section>
  <div class="footer">StudentHub · Student Records REST API · Built with Node.js & Express</div>
</main>
</div>

<div class="modal-backdrop" id="backdrop" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <h2>Add a student</h2>
    <p class="muted">Enter the student details below.</p>
    <form id="studentForm">
      <div class="field"><label for="name">Full name</label><input id="name" required placeholder="e.g. Aman Sharma"></div>
      <div class="field"><label for="email">Email address</label><input id="email" type="email" required placeholder="aman@example.com"></div>
      <div class="field"><label for="age">Age</label><input id="age" type="number" min="1" step="1" required placeholder="e.g. 20"></div>
      <div id="formError" style="color:#fda4af;font-size:13px;margin-top:12px"></div>
      <div class="form-actions"><button type="button" class="button secondary" onclick="closeModal()">Cancel</button><button class="button" type="submit">Save Student</button></div>
    </form>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
let allStudents = [];

function notify(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2800);
}

function openModal() {
  document.getElementById('formError').textContent = '';
  document.getElementById('backdrop').style.display = 'flex';
  document.getElementById('name').focus();
}
function closeModal() {
  document.getElementById('backdrop').style.display = 'none';
}

async function loadStudents() {
  try {
    const response = await fetch('/students');
    if (!response.ok) throw new Error('Could not load students');
    allStudents = await response.json();
    render();
  } catch (error) {
    notify('Unable to connect to the API server.');
  }
}

function render() {
  const query = document.getElementById('search').value.toLowerCase().trim();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query) ||
    String(s.id).includes(query)
  );

  document.getElementById('total').textContent = allStudents.length;
  document.getElementById('adult').textContent = allStudents.filter(s => s.age >= 18).length;
  document.getElementById('average').textContent = allStudents.length
    ? (allStudents.reduce((sum, s) => sum + s.age, 0) / allStudents.length).toFixed(1)
    : '—';

  document.getElementById('rows').innerHTML = filtered.map(s => {
    const initial = escapeHtml(s.name.trim().charAt(0).toUpperCase());
    return '<tr><td><div class="person"><div class="person-icon">' + initial +
      '</div><div><div class="person-name">' + escapeHtml(s.name) +
      '</div><div class="email">' + escapeHtml(s.email) +
      '</div></div></div></td><td>#' + s.id +
      '</td><td><span class="age-pill">' + s.age +
      ' yrs</span></td><td><button class="action" onclick="viewStudent(' + s.id +
      ')">View</button><button class="action delete" onclick="deleteStudent(' + s.id +
      ')">Delete</button></td></tr>';
  }).join('');

  document.getElementById('empty').style.display = filtered.length ? 'none' : 'block';
  document.querySelector('.table-wrap').style.display = filtered.length ? 'block' : 'none';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[char]);
}

async function viewStudent(id) {
  try {
    const response = await fetch('/students/' + id);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Student not found');
    alert('Student Details\\n\\nID: ' + data.id + '\\nName: ' + data.name +
      '\\nEmail: ' + data.email + '\\nAge: ' + data.age);
  } catch (error) {
    notify(error.message);
  }
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete student #' + id + '?')) return;
  try {
    const response = await fetch('/students/' + id, { method: 'DELETE' });
    if (response.status === 204) {
      notify('Student deleted successfully.');
      await loadStudents();
    } else {
      const data = await response.json();
      notify(data.error || 'Could not delete student.');
    }
  } catch (error) {
    notify('Unable to connect to the API server.');
  }
}

document.getElementById('studentForm').addEventListener('submit', async event => {
  event.preventDefault();
  const formError = document.getElementById('formError');
  formError.textContent = '';

  const age = Number(document.getElementById('age').value);
  if (!Number.isInteger(age) || age <= 0) {
    formError.textContent = 'Please enter a valid positive whole-number age.';
    return;
  }

  const student = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    age
  };

  try {
    const response = await fetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    const data = await response.json();

    if (!response.ok) {
      formError.textContent = data.error || 'Unable to add student.';
      return;
    }

    document.getElementById('studentForm').reset();
    closeModal();
    notify('Student added successfully!');
    await loadStudents();
  } catch (error) {
    formError.textContent = 'Unable to connect to the API server.';
  }
});

loadStudents();
</script>
</body>
</html>`);
});

// POST /students
app.post("/students", (req, res) => {
  const { name, email, age } = req.body || {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !isValidEmail(email.trim()) ||
    typeof age !== "number" ||
    !Number.isInteger(age) ||
    age <= 0
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  if (students.some(s => s.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const student = {
    id: nextId++,
    name: name.trim(),
    email: email.trim(),
    age
  };

  students.push(student);
  return res.status(201).json(student);
});

// GET /students and optional minimum age filter
app.get("/students", (req, res) => {
  let result = students;

  if (req.query.minAge !== undefined) {
    const raw = req.query.minAge;
    const minAge = Number(raw);

    if (raw.trim() === "" || !Number.isFinite(minAge) || minAge < 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    result = students.filter(s => s.age >= minAge);
  }

  return res.status(200).json(result);
});

// GET /students/:id
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);

  if (!Number.isInteger(id) || !student) {
    return res.status(404).json({ error: "Student not found" });
  }

  return res.status(200).json(student);
});

// DELETE /students/:id
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (!Number.isInteger(id) || index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  students.splice(index, 1);
  return res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running at http://localhost:" + PORT));
