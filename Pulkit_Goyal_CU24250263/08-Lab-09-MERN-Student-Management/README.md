# Lab Sheet 9: Node.js, Express, MongoDB & Frontend Full Stack CRUD Application

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Questions
1. Design and build a production-grade **RESTful API** using **Node.js** and **Express.js**.
2. Connect to a **MongoDB** database via **Mongoose ODM** with schema validation rules.
3. Implement complete CRUD operations:
   - `POST /api/students`: Create student record (name, cuid, roll, email, course, marks).
   - `GET /api/students`: Retrieve all student records (with optional query filter).
   - `GET /api/students/:id`: Retrieve single student record.
   - `PUT /api/students/:id`: Update existing student record.
   - `DELETE /api/students/:id`: Remove student record.
4. Build a responsive, framework-free frontend (`index.html`, `style.css`, `script.js`) consuming the API using modern asynchronous `fetch()` calls.
5. Provide error handling, CORS headers, environment variable isolation (`dotenv`), and interactive UI alerts.

---

## 2. Directory Structure
```
08-Lab-09-MERN-Student-Management/
├── README.md                      # Lab documentation & viva notes
├── backend/
│   ├── .env.example               # Environment template
│   ├── package.json               # Backend dependencies (express, mongoose, cors, dotenv)
│   ├── server.js                  # Express application & MongoDB connection
│   ├── models/
│   │   └── Student.js             # Mongoose Schema & validation
│   └── routes/
│       └── studentRoutes.js       # RESTful route controllers
└── frontend/
    ├── index.html                 # Student dashboard interface
    ├── style.css                  # Clean presentation styles
    └── script.js                  # Asynchronous CRUD API client
```

---

## 3. How to Run Locally

### Backend Setup:
```bash
cd 08-Lab-09-MERN-Student-Management/backend
npm install
# Create .env from template
cp .env.example .env
# Start server (default: port 5000)
npm start
```

### Frontend Setup:
Simply open `08-Lab-09-MERN-Student-Management/frontend/index.html` in your web browser, or serve it via Live Server.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: What is the role of CORS (`cors` middleware) in Express?
- Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts web pages from requesting data from a domain/port different from the one that served the page. The `cors()` middleware sends HTTP response headers (like `Access-Control-Allow-Origin: *`) permitting the frontend (running on port 5500/3000) to communicate with the Express backend (running on port 5000).

### Q2: What are the primary HTTP status codes used in REST APIs?
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created (POST).
- `400 Bad Request`: Validation failure or malformed payload.
- `404 Not Found`: Requested resource ID does not exist.
- `500 Internal Server Error`: Unhandled server exception.

### Q3: Why use Mongoose instead of the native MongoDB driver?
- Mongoose provides structured schema enforcement, data type validation, pre/post middleware hooks, default values, and intuitive model methods (`find()`, `findByIdAndUpdate()`, `findByIdAndDelete()`).
