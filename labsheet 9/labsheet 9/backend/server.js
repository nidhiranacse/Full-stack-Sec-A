const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory student store (no MongoDB needed for lab)
let students = [
  { _id: "1", name: "Asha Rao", rollNo: "CS101", course: "BTech CSE", marks: 88 },
  { _id: "2", name: "Rahul Kumar", rollNo: "CS102", course: "BTech IT", marks: 92 },
  { _id: "3", name: "Priya Singh", rollNo: "CS103", course: "BTech CSE", marks: 78 },
];
let nextId = 4;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
// GET /students - list all
app.get("/students", (req, res) => {
  res.json(students);
});

// GET /students/:id - get one
app.get("/students/:id", (req, res) => {
  const student = students.find(s => s._id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

// POST /students - create
app.post("/students", (req, res) => {
  const { name, rollNo, course, marks } = req.body;
  if (!name || !rollNo || !course || marks === undefined) {
    return res.status(400).json({ error: "All fields required" });
  }
  if (marks < 0 || marks > 100) {
    return res.status(400).json({ error: "Marks must be 0-100" });
  }
  const student = { _id: String(nextId++), name, rollNo, course, marks };
  students.push(student);
  res.status(201).json(student);
});

// PUT /students/:id - update
app.put("/students/:id", (req, res) => {
  const idx = students.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Student not found" });
  const { name, rollNo, course, marks } = req.body;
  if (marks !== undefined && (marks < 0 || marks > 100)) {
    return res.status(400).json({ error: "Marks must be 0-100" });
  }
  students[idx] = { ...students[idx], ...req.body };
  res.json(students[idx]);
});

// DELETE /students/:id
app.delete("/students/:id", (req, res) => {
  const idx = students.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Student not found" });
  students.splice(idx, 1);
  res.json({ message: "Deleted successfully" });
});

app.get("/", (req, res) => {
  res.send("Student Record Management API is running...");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
