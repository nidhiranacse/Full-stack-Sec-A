/*
LAB SHEET 09 — Student Record Management System
Single-file Express + Mongoose + browser frontend.
Install:
npm init -y
npm i express mongoose cors
Run MongoDB locally, then:
node Lab9.js
Open http://localhost:3000
*/

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_lab";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true, unique: true },
    course: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

function validateStudent(body) {
  const { name, rollNo, course, marks } = body;
  const errors = [];

  if (!name || !name.trim()) errors.push("Name is required.");
  if (!rollNo || !rollNo.trim()) errors.push("Roll No. is required.");
  if (!course || !course.trim()) errors.push("Course is required.");

  const m = Number(marks);
  if (marks === "" || Number.isNaN(m) || m < 0 || m > 100) {
    errors.push("Marks must be between 0 and 100.");
  }

  return errors;
}

// CREATE
app.post("/students", async (req, res) => {
  try {
    const errors = validateStudent(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const student = await Student.create({
      name: req.body.name,
      rollNo: req.body.rollNo,
      course: req.body.course,
      marks: Number(req.body.marks)
    });

    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Roll No. already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
app.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json(student);
  } catch {
    res.status(400).json({ error: "Invalid student ID." });
  }
});

// UPDATE
app.put("/students/:id", async (req, res) => {
  try {
    const errors = validateStudent(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        rollNo: req.body.rollNo,
        course: req.body.course,
        marks: Number(req.body.marks)
      },
      { new: true, runValidators: true }
    );

    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json({ message: "Student deleted successfully." });
  } catch {
    res.status(400).json({ error: "Invalid student ID." });
  }
});

// Frontend — uses fetch + async/await
app.get("/", (req, res) => {
  res.send(`<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>Student Record Management</title>
<style>
body{font-family:Arial;margin:0;background:#f4f7fb;color:#172033}
main{max-width:1100px;margin:35px auto;padding:20px}
.box{background:white;padding:25px;border-radius:14px;box-shadow:0 5px 20px #0001;margin-bottom:20px}
h1{color:#2563eb}form{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
input{padding:11px;border:1px solid #cbd5e1;border-radius:7px}
button{padding:10px 15px;border:0;border-radius:7px;background:#2563eb;color:white;cursor:pointer}
table{width:100%;border-collapse:collapse;margin-top:20px}
th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}
.del{background:#dc2626}.edit{background:#64748b}.error{color:#dc2626}
@media(max-width:650px){form{grid-template-columns:1fr}table{font-size:13px}}
</style>
</head>
<body><main>
<div class="box">
<h1>Student Record Management</h1>
<form id="form">
<input id="name" placeholder="Name" required>
<input id="rollNo" placeholder="Roll No." required>
<input id="course" placeholder="Course" required>
<input id="marks" type="number" min="0" max="100" placeholder="Marks" required>
<button type="submit">Save Student</button>
<button type="button" onclick="resetForm()">Clear</button>
</form><p id="msg"></p>
</div>
<div class="box"><h2>Student Records</h2>
<table><thead><tr><th>Name</th><th>Roll</th><th>Course</th><th>Marks</th><th>Actions</th></tr></thead>
<tbody id="rows"></tbody></table></div>
</main>
<script>
let editingId=null;
const form=document.getElementById("form");
const msg=document.getElementById("msg");
async function loadStudents(){
 const res=await fetch("/students"); const data=await res.json();
 document.getElementById("rows").innerHTML=data.map(s =>
  "<tr><td>"+s.name+"</td><td>"+s.rollNo+"</td><td>"+s.course+
  "</td><td>"+s.marks+"</td><td><button class='edit' onclick='editStudent(\""+s._id+"\")'>Edit</button> "+
  "<button class='del' onclick='deleteStudent(\""+s._id+"\")'>Delete</button></td></tr>"
 ).join("");
}
form.addEventListener("submit",async e=>{
 e.preventDefault();
 const body={name:name.value,rollNo:rollNo.value,course:course.value,marks:marks.value};
 const url=editingId?"/students/"+editingId:"/students";
 const method=editingId?"PUT":"POST";
 const res=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const data=await res.json();
 if(!res.ok){msg.className="error";msg.textContent=data.errors?.join(" ")||data.error;return}
 msg.className="";msg.textContent="Saved successfully.";resetForm();loadStudents();
});
async function editStudent(id){
 const s=await (await fetch("/students/"+id)).json();
 name.value=s.name;rollNo.value=s.rollNo;course.value=s.course;marks.value=s.marks;editingId=id;
}
async function deleteStudent(id){
 if(!confirm("Delete this record?"))return;
 await fetch("/students/"+id,{method:"DELETE"});loadStudents();
}
function resetForm(){editingId=null;form.reset()}
loadStudents();
</script></body></html>`);
});

mongoose.connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log("Server: http://localhost:"+PORT)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
