# 🗂️ Task Manager REST API

A secure Task Manager REST API built with **Node.js** and **Express** that stores users and tasks in memory. Features JWT authentication, bcrypt password hashing, rate limiting, role-based access control, and pagination.

---

## 📋 Features

| Feature | Details |
|---|---|
| **Authentication** | JWT tokens (15-min expiry) with bcrypt password hashing |
| **Rate Limiting** | 5 failed login attempts per email per minute → 429 + `Retry-After` |
| **Authorization** | Users manage their own tasks; admins can manage any task |
| **CRUD Tasks** | Create, Read, Update, Delete with status validation |
| **Pagination** | `?page=1&limit=10` on GET /tasks |
| **Filtering** | `?status=todo` / `doing` / `done` on GET /tasks |
| **Error Handling** | Proper HTTP codes (400, 401, 403, 404, 409, 429, 500) |
| **Testable** | Exports Express `app` for use with supertest or similar |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

The API runs on **http://localhost:3000** by default.

---

## 🔐 Environment Variables

Create a `.env` file (already included):

```env
JWT_SECRET=super_secret_task_manager_key_change_in_production
PORT=3000
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | `{ name, email, password, role? }` | Register (role defaults to `user`) |
| POST | `/auth/login` | `{ email, password }` | Get JWT token |

### Tasks (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Body / Query | Description |
|--------|----------|--------------|-------------|
| POST | `/tasks` | `{ title, status? }` | Create a task (status defaults to `todo`) |
| GET | `/tasks` | `?page=&limit=&status=` | List tasks with pagination & filter |
| GET | `/tasks/:id` | — | Get a single task |
| PUT | `/tasks/:id` | `{ title?, status? }` | Update a task |
| DELETE | `/tasks/:id` | — | Delete a task |

---

## 🧪 Example Usage (cURL)

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Shashwat","email":"shashwat@example.com","password":"secret123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shashwat@example.com","password":"secret123"}'
```

### Create Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"title":"Finish lab 12","status":"doing"}'
```

### Get Tasks (with filter & pagination)
```bash
curl http://localhost:3000/tasks?status=doing&page=1&limit=5 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 📁 Project Structure

```
labsheet 12/
├── .env                        # Environment variables
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js                  # Express app (exported for tests)
    ├── server.js               # Entry point (npm start)
    ├── store.js                # In-memory Maps for users & tasks
    ├── middleware/
    │   ├── auth.js             # JWT authentication & role middleware
    │   └── rateLimiter.js      # Login rate limiting (5/min/email)
    └── routes/
        ├── auth.js             # POST /auth/register & /auth/login
        └── tasks.js            # CRUD /tasks
```

---

## ⚠️ Error Codes

| Code | When |
|------|------|
| `400` | Invalid input / missing fields / bad status |
| `401` | Missing / malformed / expired token, wrong credentials |
| `403` | Trying to access another user's task (non-admin) |
| `404` | Task or route not found |
| `409` | Duplicate email on registration |
| `429` | Rate limit exceeded (too many failed logins) |
| `500` | Unexpected server error |
