# CampusConnect — Labsheet 10 Shashwat

> **A secure, real-time college event and announcement portal**
> Built with Node.js · Express · SQLite · React · Socket.io · JWT · Docker

---

## Objective

To develop a complete full-stack application demonstrating:
- JWT Authentication with access & refresh tokens
- Role-Based Access Control (RBAC — ADMIN / STUDENT)
- Real-time communication via Socket.io
- In-memory caching (node-cache as a simple Redis replacement)
- Request validation and security middleware
- Search, pagination, and RSVP functionality
- Automated testing with Jest + Supertest
- Containerisation with Docker Compose

---

## Tech Stack

| Layer         | Technology                                    |
|---------------|-----------------------------------------------|
| Frontend      | React 18, React Router v6, Context API, Vite  |
| Backend       | Node.js, Express.js                           |
| Database      | **LowDB v1** (JSON file) — zero native compilation, pure JavaScript |
| Auth          | JWT (access 15m + refresh 7d), bcryptjs       |
| Real-time     | Socket.io                                     |
| Cache         | node-cache (in-process, replaces Redis)       |
| Security      | helmet, cors, express-rate-limit, express-validator |
| Testing       | Jest, Supertest                               |
| Deploy        | Docker, Docker Compose                        |

---

## Project Structure

```
labsheet 10 Shashwat/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              ← SQLite connection + schema init
│   │   │   └── auth.js            ← JWT secrets & expiry config
│   │   ├── middleware/
│   │   │   ├── auth.js            ← Bearer token verification
│   │   │   ├── rbac.js            ← Role-based access control
│   │   │   ├── rateLimiter.js     ← Global & login rate limits
│   │   │   └── validate.js        ← express-validator error handler
│   │   ├── routes/
│   │   │   ├── auth.js            ← /api/auth/*
│   │   │   ├── events.js          ← /api/events/*
│   │   │   └── announcements.js   ← /api/announcements/*
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── eventsController.js
│   │   │   └── announcementsController.js
│   │   ├── services/
│   │   │   ├── cacheService.js    ← node-cache wrapper
│   │   │   └── socketService.js   ← Socket.io singleton
│   │   └── __tests__/
│   │       └── app.test.js        ← Full API test suite
│   ├── data/                      ← campusconnect.json (auto-created)
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    ← Auth state + authFetch + Socket.io
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx      ← RSVP toggle card
│   │   │   ├── Pagination.jsx
│   │   │   ├── Toast.jsx          ← Socket.io real-time toast
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx      ← Stats + live announcements
│   │   │   ├── Events.jsx         ← Search + pagination + RSVP
│   │   │   └── AdminPanel.jsx     ← CRUD events & announcements
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## Database Schema (SQLite)

```sql
users         (id, name, email, password, role, refreshToken, createdAt)
events        (id, title, description, date, location, createdBy→users, createdAt, updatedAt)
rsvps         (id, userId→users, eventId→events ON DELETE CASCADE, createdAt) UNIQUE(userId,eventId)
announcements (id, title, content, createdBy→users, createdAt)
```

---

## REST API Endpoints

### Auth  `/api/auth`
| Method | Endpoint    | Description                        | Auth |
|--------|-------------|------------------------------------|------|
| POST   | /register   | Register new user (ADMIN/STUDENT)  | —    |
| POST   | /login      | Login → access + refresh tokens    | —    |
| POST   | /refresh    | Get new token pair via refresh     | —    |
| POST   | /logout     | Invalidate refresh token           | —    |

### Events  `/api/events`
| Method | Endpoint       | Description                         | Auth    |
|--------|----------------|-------------------------------------|---------|
| GET    | /              | List events (search, page, limit)   | Any     |
| GET    | /my-rsvps      | Events the current user RSVP'd      | Any     |
| GET    | /:id           | Single event                        | Any     |
| POST   | /              | Create event                        | ADMIN   |
| PUT    | /:id           | Update event                        | ADMIN   |
| DELETE | /:id           | Delete event (cascades RSVPs)       | ADMIN   |
| POST   | /:id/rsvp      | Toggle RSVP                         | Any     |

### Announcements  `/api/announcements`
| Method | Endpoint | Description                            | Auth  |
|--------|----------|----------------------------------------|-------|
| GET    | /        | List announcements (latest 30)         | Any   |
| POST   | /        | Create & broadcast via Socket.io       | ADMIN |
| DELETE | /:id     | Delete announcement                    | ADMIN |

---

## Running Locally

### 1. Backend

```bash
cd backend
npm install
npm run dev       # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

> The Vite dev server proxies `/api` and `/socket.io` to the backend automatically.

### 3. Run Tests

```bash
cd backend
npm test
```

---

## Running with Docker

```bash
# From the project root
docker-compose up --build

# Frontend → http://localhost:5173
# Backend  → http://localhost:5000
```

---

## Key Features

### Security
- Passwords hashed with **bcrypt** (10 rounds)
- JWT access token (15 min) + refresh token (7 days) stored securely
- **Helmet** sets secure HTTP headers
- **CORS** restricted to frontend origin
- **Rate limiting**: 100 req/15 min global, 5 req/15 min on login endpoint
- Input validation via **express-validator** on all write endpoints

### Real-time
- **Socket.io** broadcasts `new_announcement` to all connected clients
- Dashboard shows a **🔴 Live** indicator when Socket.io is connected
- **Toast notifications** pop up instantly when an admin creates an announcement

### Caching
- Event list responses are cached in-memory for **60 seconds**
- Cache is **automatically invalidated** on any create/update/delete operation
- Responses include `cached: true` flag when served from cache

### RBAC
- `ADMIN` role: full CRUD on events & announcements
- `STUDENT` role: read events, RSVP, read announcements
- Enforced both in backend middleware and frontend protected routes

---

## Test Coverage

```
🔐 Auth Routes
  ✓ Register admin
  ✓ Register student
  ✓ Duplicate email → 409
  ✓ Validation error → 400
  ✓ Login success → 200
  ✓ Wrong password → 401
  ✓ Refresh token → 200
  ✓ Logout → 200

🗓️ Events Routes
  ✓ Unauthenticated → 401
  ✓ Admin creates event → 201
  ✓ Student cannot create → 403
  ✓ List with pagination → 200
  ✓ Cached on 2nd call
  ✓ Search filter works
  ✓ Single event → 200
  ✓ RSVP toggle (create / cancel)
  ✓ My RSVPs
  ✓ Admin updates event → 200
  ✓ Admin deletes event → 200
  ✓ 404 after deletion

📢 Announcements Routes
  ✓ Student cannot create → 403
  ✓ Admin creates → 201 (+ Socket.io emit)
  ✓ List → 200
  ✓ Admin deletes → 200

💚 Health Check → 200
```
