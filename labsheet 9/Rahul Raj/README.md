# Lab Sheet 09: Student Record Management Full-Stack CRUD Application

**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Course:** Full Stack Web Development (Sec-A)  

---

## Project Overview

This full-stack CRUD application manages student records by integrating an Express.js REST API, SQLite database persistence, and an interactive frontend demonstrating the complete request-response cycle:

1. **Frontend Interface (`public/index.html`)**:
   - Single-page application consuming REST APIs via `fetch` with `async/await`.
   - Client-side form validation (Roll No required, Marks between 0 and 100, Name required).
   - Dynamic table rendering with in-place Edit modals and Delete confirmations.
   - Real-time analytics dashboard: Enrolled student count, average marks, and top marks.
2. **Backend REST API (`server.js`)**:
   - `GET /students`: Fetch all student records.
   - `GET /students/:id`: Fetch single student record by primary key.
   - `POST /students`: Add a new student record (validates uniqueness of Roll No).
   - `PUT /students/:id`: Update existing student properties.
   - `DELETE /students/:id`: Remove student record.
3. **Database Layer (`models/Student.js`)**:
   - Persistent SQLite storage (`students.sqlite`) using Node's built-in `node:sqlite` engine.
   - Pre-seeded with initial academic records for out-of-the-box evaluation.

---

## Directory Architecture

```
Lab Sheet 9/
├── package.json               # Express, CORS dependencies
├── server.js                  # REST API server & static server
├── api_test.js                # Automated test runner (6/6 tests passed)
├── students.sqlite            # Persistent SQLite database
├── README.md                  # Comprehensive documentation
├── models/
│   └── Student.js             # Data access object & schema definition
└── public/
    └── index.html             # Client-side CRUD interface & analytics
```

---

## How to Run & Verify

### Run Automated Endpoint Tests
```bash
npm test
# Or: node api_test.js
```

### Start Development Server
```bash
npm start
# Or: node server.js
```
Open `http://localhost:5000/` in your browser.
