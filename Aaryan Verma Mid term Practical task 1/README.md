# Practical B1: JWT Authentication API (Node.js & Express)

**Student Name:** Aaryan Verma  
**Subject:** Full Stack Practical  
**Folder:** `TASK 1`  
**Marks:** 5  

---

## 🎯 Aim
To implement user registration, login and a protected route using JSON Web Tokens (JWT) in an Express application.

## 📋 Problem Statement
Implement a service where users register with a username and password, log in to receive a token, and then use the token to access a protected profile route.

---

## 🚀 Requirements & Specification Matrix

| Endpoint | Method | Request Payload / Header | Scenario / Condition | HTTP Status | Response JSON |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/register` | `POST` | `{ "username": "...", "password": "..." }` | Success | **201** | `{ "message": "User registered" }` |
| `/register` | `POST` | `{ "username": "", "password": "123" }` | Username missing/empty OR password < 6 chars | **400** | `{ "error": "Invalid input" }` |
| `/register` | `POST` | `{ "username": "existing", ... }` | Username already taken | **409** | `{ "error": "Username already exists" }` |
| `/login` | `POST` | `{ "username": "...", "password": "..." }` | Success (1h expiry, payload has `username`) | **200** | `{ "token": "<jwt>" }` |
| `/login` | `POST` | `{ "username": "...", "password": "..." }` | Unknown user OR incorrect password | **401** | `{ "error": "Invalid credentials" }` |
| `/profile` | `GET` | `Authorization: Bearer <token>` | Valid token verified | **200** | `{ "username": "<username>" }` |
| `/profile` | `GET` | Missing / Malformed / Expired / Invalid signature | Unauthorized | **401** | `{ "error": "Unauthorized" }` |

---

## 🛠️ Technology Stack
- **Runtime:** Node.js (v24+)
- **Framework:** Express.js
- **Token Management:** `jsonwebtoken` (JWT, HS256, 1-hour expiration)
- **Password Security:** `bcryptjs` (salt rounds: 10)
- **CORS:** `cors` middleware
- **Frontend UI:** Vanilla HTML5, CSS3 (Light theme: White, Cream `#FAF7EE`, Sky Blue `#0EA5E9`), Vanilla JavaScript with real-time token inspector and automated edge-case test runner.

---

## 📂 Project Structure

```
TASK 1/
├── package.json        # Dependencies & scripts
├── server.js          # Express server with /register, /login, and /profile endpoints
├── test-api.js        # Automated verification script testing all 12 edge cases
├── README.md          # Documentation & submission notes
└── public/            # Modern light-themed Frontend Portal
    ├── index.html     # Interactive UI with forms, inspector, and test suite
    ├── style.css      # White, cream, and sky-blue design system
    └── app.js         # Client-side state, JWT parsing & live testing runner
```

---

## ⚡ How to Run

### 1. Install Dependencies
```bash
cd "TASK 1"
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will start at: `http://localhost:3000`

### 3. Open in Browser
Visit `http://localhost:3000` to interact with the light-themed Web UI, register/login, inspect JWT tokens in real-time, and run the automated test suite.

### 4. Run the Automated API Test Suite
```bash
npm test
```
All 12 edge cases will run and report `[PASS]` status.

---

## 🧪 Terminal cURL Commands

### 1. Register User (Valid)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"aaryan\",\"password\":\"mypassword123\"}"
```
*Response (201):*
```json
{ "message": "User registered" }
```

### 2. Register with Short Password (< 6 chars)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"aaryan\",\"password\":\"123\"}"
```
*Response (400):*
```json
{ "error": "Invalid input" }
```

### 3. Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"aaryan\",\"password\":\"mypassword123\"}"
```
*Response (200):*
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

### 4. Access Protected Profile
```bash
curl http://localhost:3000/profile \
  -H "Authorization: Bearer <TOKEN_HERE>"
```
*Response (200):*
```json
{ "username": "aaryan" }
```

### 5. Access Protected Profile without Token
```bash
curl http://localhost:3000/profile
```
*Response (401):*
```json
{ "error": "Unauthorized" }
```
