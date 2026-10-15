const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_records';

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    rollNo: { type: String, required: true, trim: true, unique: true, maxlength: 30 },
    course: { type: String, required: true, trim: true, maxlength: 80 },
    marks: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function sendError(response, status, message) {
  return response.status(status).json({ message });
}

function studentPayload(body) {
  return {
    name: typeof body.name === 'string' ? body.name.trim() : body.name,
    rollNo: typeof body.rollNo === 'string' ? body.rollNo.trim() : body.rollNo,
    course: typeof body.course === 'string' ? body.course.trim() : body.course,
    marks: body.marks
  };
}

app.get('/health', (request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/students', async (request, response) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    response.json(students);
  } catch (error) {
    sendError(response, 500, 'Unable to fetch student records.');
  }
});

app.get('/students/:id', async (request, response) => {
  try {
    const student = await Student.findById(request.params.id);
    if (!student) return sendError(response, 404, 'Student record not found.');
    response.json(student);
  } catch (error) {
    sendError(response, 400, 'Invalid student record ID.');
  }
});

app.post('/students', async (request, response) => {
  try {
    const student = await Student.create(studentPayload(request.body));
    response.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) return sendError(response, 409, 'That roll number already exists.');
    if (error.name === 'ValidationError') return sendError(response, 400, Object.values(error.errors)[0].message);
    sendError(response, 500, 'Unable to create student record.');
  }
});

app.put('/students/:id', async (request, response) => {
  try {
    const student = await Student.findByIdAndUpdate(
      request.params.id,
      studentPayload(request.body),
      { new: true, runValidators: true }
    );
    if (!student) return sendError(response, 404, 'Student record not found.');
    response.json(student);
  } catch (error) {
    if (error.code === 11000) return sendError(response, 409, 'That roll number already exists.');
    if (error.name === 'ValidationError') return sendError(response, 400, Object.values(error.errors)[0].message);
    sendError(response, 400, 'Invalid student record ID or data.');
  }
});

app.delete('/students/:id', async (request, response) => {
  try {
    const student = await Student.findByIdAndDelete(request.params.id);
    if (!student) return sendError(response, 404, 'Student record not found.');
    response.json({ message: 'Student record deleted.' });
  } catch (error) {
    sendError(response, 400, 'Invalid student record ID.');
  }
});

app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    app.listen(port, () => console.log(`Student records app running at http://localhost:${port}`));
  } catch (error) {
    console.error(`Could not connect to MongoDB at ${mongoUri}.`);
    console.error('Start MongoDB or update MONGODB_URI in .env before running the app.');
    process.exit(1);
  }
}

startServer();
