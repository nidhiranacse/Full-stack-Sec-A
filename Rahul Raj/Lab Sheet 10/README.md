# Lab Sheet 10: CampusConnect &mdash; Enterprise Event & Announcement Portal

**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Course:** Full Stack Web Development (Sec-A)  

---

## Project Overview

CampusConnect is a production-grade, containerized full-stack web application designed for university event management and real-time announcements. It integrates JWT-based authentication, Role-Based Access Control (RBAC), WebSocket real-time notifications via Socket.io, high-throughput Redis caching, security hardening, automated test suites, and Docker orchestration:

### Delivered Tasks & Syllabus Criteria

1. **Task 1: Authentication & Role-Based Access Control (RBAC)**:
   - User schema with `name`, `email`, `passwordHash`, and `role` (`ADMIN` / `STUDENT`).
   - Passwords hashed using `bcrypt` (10 salt rounds).
   - `/api/auth/register` and `/api/auth/login` issuing signed JWT access token (15 min expiry) + refresh token (httpOnly cookie, 7 days).
   - Custom `authenticate` and `authorize('ADMIN')` middleware (Students rejected with 403 Forbidden).
   - Refresh token rotation endpoint `/api/auth/refresh`.

2. **Task 2: Real-Time Notifications [Socket.io]**:
   - Integrated WebSocket server alongside Express.
   - When an Admin broadcasts an announcement, the server immediately emits `new-announcement` to all connected Student client sockets.
   - Frontend renders a live toast and an animated notification badge counter without page reload.
   - Graceful socket reconnection handling.

3. **Task 3: Redis Caching Layer**:
   - Caches `GET /api/events` response with 60-second TTL (`X-Cache-Status: HIT/MISS`).
   - Automatic cache invalidation when an Admin creates, updates, or deletes an event.
   - Response-time benchmarking tool (`benchmark.js`) demonstrating **6.49x speedup** (84.6% latency reduction).

4. **Task 4: React Frontend with State Management**:
   - Single Page Application built with React 18 and Vite.
   - Role-aware Dashboard displaying Admin controls vs. Student RSVP catalogs.
   - Event list with search-by-title, category filters, and live RSVP confirmations.
   - Pre-compiled production bundle in `dist/`.

5. **Task 5: Security Hardening**:
   - `express-rate-limit` enforcing maximum 5 login attempts per 15 minutes per IP.
   - Structured JSON validation errors.
   - Strict CORS configuration and `helmet` security headers.

6. **Task 6: Automated Integration & Unit Testing**:
   - Integration test runner (`tests/integration.test.js`) validating 6 critical pathways (registration, 401 on wrong password, 401 without token, 403 for student on admin routes, 201 event creation, and Redis cache hit). **6/6 tests passing**.

7. **Task 7: Containerization & Deployment**:
   - Multi-stage `Dockerfile` for React frontend.
   - Production `Dockerfile` for Node.js backend.
   - `docker-compose.yml` orchestrating frontend, backend, MongoDB, and Redis with volumes and network isolation.

---

## Directory Architecture

```
Lab Sheet 10/
├── docker-compose.yml         # Task 7: Multi-container orchestration
├── benchmark.js               # Task 3: Performance benchmark tool (100 reqs)
├── README.md                  # Comprehensive architectural specs
├── backend/
│   ├── package.json           # Express, Socket.io, Helmet, Redis, JWT
│   ├── Dockerfile             # Production backend container build
│   ├── src/
│   │   ├── server.js          # Express + Socket.io server
│   │   ├── config/
│   │   │   ├── db.js          # Database access layer & memory store
│   │   │   └── redis.js       # Redis client with 60s TTL
│   │   ├── middleware/
│   │   │   ├── auth.js        # authenticate & authorize(role)
│   │   │   └── rateLimiter.js # express-rate-limit
│   │   └── routes/
│   │       ├── authRoutes.js  # /register, /login, /refresh
│   │       ├── eventRoutes.js # /events (cached), /events (admin), /rsvp
│   │       └── announcementRoutes.js # /announcements (socket broadcast)
│   └── tests/
│       └── integration.test.js # Automated integration tests (6/6 passed)
└── frontend/
    ├── package.json           # React 18, Socket.io client, Vite
    ├── vite.config.js
    ├── Dockerfile             # Multi-stage production build
    ├── dist/                  # Pre-compiled production Vite bundle
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx            # Role-aware SPA with Socket.io listener
    │   └── App.css            # Dark glassmorphic design system
    └── index.html
```

---

## How to Run & Verify

### 1. Run Automated Backend Integration Tests
```bash
cd backend
npm test
```

### 2. Run Response-Time Benchmarking Tool
```bash
node benchmark.js
```

### 3. Start Backend Server
```bash
cd backend
npm start
```

### 4. Run via Docker Compose (Task 7)
```bash
docker compose up --build
```
