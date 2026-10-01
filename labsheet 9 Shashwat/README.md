# Lab Sheet 9 — Student Record Management System

**Student:** Shashwat Saini (CU24250052)  
**Lab:** Full Stack Web Development — Lab Sheet 9

---

## Aim
To develop and test a full-stack Student Record Management System demonstrating the complete frontend → REST API → backend → database request-response cycle.

## Tech Stack

| Layer    | Technology                   |
|----------|------------------------------|
| Frontend | HTML5, CSS3, Vanilla JS      |
| Backend  | Node.js, Express.js          |
| Database | MongoDB with Mongoose ODM    |
| Testing  | Postman / Thunder Client     |

## Project Structure

```
labsheet 9 Shashwat/
├── backend/
│   ├── models/
│   │   └── Student.js        ← Mongoose Schema
│   ├── routes/
│   │   └── studentRoutes.js  ← REST API routes
│   ├── db.js                 ← MongoDB connection
│   ├── server.js             ← Express entry point
│   ├── .env                  ← Environment variables
│   └── package.json
└── frontend/
    ├── index.html            ← UI structure
    ├── style.css             ← Premium dark UI styles
    └── app.js                ← Fetch API + async/await logic
```

## REST API Endpoints

| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| GET    | /students         | Get all students      |
| POST   | /students         | Add new student       |
| GET    | /students/:id     | Get one student       |
| PUT    | /students/:id     | Update student        |
| DELETE | /students/:id     | Delete student        |

## How to Run

### Prerequisites
- Node.js installed
- MongoDB running locally (or MongoDB Atlas URI in `.env`)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev     # Uses nodemon for auto-reload
```
Server runs at: `http://localhost:5000`

### 2. Open Frontend
Open `frontend/index.html` directly in your browser  
*(No build step required — pure HTML/CSS/JS)*

### 3. Test APIs with Postman
- Import the collection or test manually
- Base URL: `http://localhost:5000`

## Features
- ✅ Add / Edit / Delete student records
- ✅ View all students in a styled table
- ✅ Search students by name, roll, or course
- ✅ Auto grade calculation (O, A+, A, B+, B, C, F)
- ✅ Client-side form validation
- ✅ Server-side validation with meaningful error messages
- ✅ Real-time connection status badge
- ✅ Statistics dashboard (total, average, highest, pass count)
- ✅ Delete confirmation modal
- ✅ Duplicate roll number detection
- ✅ Responsive design
