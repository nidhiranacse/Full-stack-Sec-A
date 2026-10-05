# Student Record Management System
### Full-Stack Web Application • Lab Sheet 9

---

## 📌 Project Overview

A complete full-stack CRUD application for managing student academic records built with **Node.js**, **Express**, **MongoDB (Mongoose)**, and a responsive frontend using **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 🏗️ Architecture & Tech Stack

- **Backend**: Node.js & Express.js REST API
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: Responsive HTML5, CSS3, asynchronous Fetch API
- **CORS**: Cross-Origin Resource Sharing enabled for client-server decoupling

```
┌─────────────────────────────────┐
│        Frontend Client          │
│   HTML5 • CSS3 • JavaScript     │
└──────────────┬──────────────────┘
               │ HTTP REST (Fetch API)
               ▼
┌─────────────────────────────────┐
│     Node.js + Express API       │
│    Routes • Controller • CORS   │
└──────────────┬──────────────────┘
               │ Mongoose ODM
               ▼
┌─────────────────────────────────┐
│        MongoDB Database         │
│     Student Records Schema      │
└─────────────────────────────────┘
```

---

## 🚀 Features

- **Create**: Add student records with Name, Roll Number, Course, and Marks.
- **Read**: Fetch and display all student records in an interactive data table.
- **Update**: In-place edit functionality for modifying student details.
- **Delete**: Remove student records with instant UI updates.
- **Validation**:
  - Roll Number uniqueness constraint.
  - Marks validated between 0 and 100.
  - Required field validation on both client and server.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/students` | Create new student | `{ "name", "rollNo", "course", "marks" }` |
| `GET` | `/students` | Get all student records | None |
| `GET` | `/students/:id` | Get student by ID | None |
| `PUT` | `/students/:id` | Update student details | `{ "name", "rollNo", "course", "marks" }` |
| `DELETE` | `/students/:id` | Delete student by ID | None |

---

## ⚙️ Setup & Execution

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```
*Backend server runs on `http://localhost:5000`.*

### 2. Frontend Execution
Open `frontend/index.html` directly in any web browser or serve with Live Server:
```bash
cd frontend
# Open index.html in browser
```
