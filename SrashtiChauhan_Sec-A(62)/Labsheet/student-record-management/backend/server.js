const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const app= express();
const Student = require("./models/Student");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

mongoose.connect(process.env.MONGO_URI).then(()=> console.log("MongoDB connected")).catch((err)=> console.log("Database Connection Error:",err));
const PORT=process.env.PORT || 5000;

app.post("/api/students", async (req, res) => {
    try {
        const student = new Student(req.body);
        const savedStudent = await student.save();

        res.status(201).json(savedStudent);

    }
    catch (error) {
        res.status(400).json({
            message:error.message,
        });
    }

});
app.delete("/api/students/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.put("/api/students/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

app.listen(PORT, ()=> {
    console.log(`Server is running on  http://localhost:${PORT}`);
});