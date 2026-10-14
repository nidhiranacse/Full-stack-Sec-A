const express = require("express");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

// CREATE student
router.post("/", createStudent);

// GET all students
router.get("/", getStudents);

// GET student by ID
router.get("/:id", getStudentById);

// UPDATE student
router.put("/:id", updateStudent);

// DELETE student
router.delete("/:id", deleteStudent);

module.exports = router;