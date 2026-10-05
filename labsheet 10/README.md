# CampusConnect — College Event & Announcement Portal
### Full-Stack Web Application • Lab Sheet 10

---

## 1. Project Overview & Architecture

**CampusConnect** is an enterprise-grade collegiate event and announcement portal engineered with role-based access control (**ADMIN** and **STUDENT** roles), real-time bidirectional communication via **WebSockets (Socket.io)**, server-side in-memory caching via **Redis**, robust application security hardening, and complete multi-container orchestration with **Docker & Docker Compose**.

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                 React Frontend (Vite)                    │
                  │   Redux Toolkit • Axios Interceptors • Socket.io Client │
                  └──────────────┬───────────────────────────┬───────────────┘
                                 │ HTTP (REST + JWT Bearer)  │ WebSockets (Real-time)
                                 ▼                           ▼
                  ┌──────────────────────────────────────────────────────────┐
                  │              Node.js + Express API Gateway               │
                  │  • Helmet Security Headers   • Zod Schema Validation    │
                  │  • Express Rate Limiter      • RBAC Middleware          │
                  │  • JWT Auth & Refresh Cookie • Socket.io Server         │
                  └──────────────┬───────────────────────────┬───────────────┘
                                 │                           │
                   Cache Check / │ Invalidate                │ Persistent Storage
                                 ▼                           ▼
                  ┌──────────────────────┐    ┌──────────────────────────────┐
                  │     Redis Cache      │    │       MongoDB Replica        │
                  │    60-second TTL     │    │   Users, Events, Notices     │
                  └──────────────────────┘    └──────────────────────────────┘
```

---

## 2. Tasks & Implementation Details

### Task 1 — Authentication & RBAC
- **User Schema** ([`User.js`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/backend/src/models/User.js)): `name`, `email`, `passwordHash`, `role` (`ADMIN` | `STUDENT`).
- **Bcrypt Hashing**: Automatic salting (10 rounds) before user record creation.
- **Dual-Token Authentication**:
  - **Access Token**: Short-lived (15 minutes), signed with `JWT_ACCESS_SECRET`, returned in response body and held in-memory in frontend state.
  - **Refresh Token**: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, securely transported via `httpOnly` + `sameSite` cookie.
- **Middleware**:
  - `authenticate`: Validates `Authorization: Bearer <token>` header, decodes user payload, attaches `req.user`.
  - `authorize(...roles)`: Verifies role membership. Student requests to admin routes return `403 Forbidden`.
- **Silent Refresh Endpoint**: `POST /api/auth/refresh` reads refresh token cookie, rotates access token without forcing user re-login.

### Task 2 — Real-Time Notifications
- **Socket.io Handshake Auth** ([`socket/index.js`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/backend/src/socket/index.js)): Validates JWT during socket handshake.
- **Room Isolation**: Connected sockets automatically join their respective role room (`role:students`, `role:admins`) and global `broadcast`.
- **Event Emission**: When an Admin posts a new announcement (`POST /api/announcements`), the server fires a `new-announcement` WebSocket event.
- **Frontend Live Response**:
  - Pops up a dynamic floating toast notification.
  - Increments the live badge counter in the top navigation bar in real time without refreshing the page.
  - Automatic exponential backoff and reconnection logic if socket connection drops.

### Task 3 — Redis Caching Layer
- **Cache Interception** ([`event.controller.js`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/backend/src/controllers/event.controller.js)): `GET /api/events` checks Redis key `events:list:*` with a **60-second TTL**.
  - Adds header `X-Cache: HIT` on cache hits.
  - Adds header `X-Cache: MISS` on misses and populates Redis.
- **Automatic Invalidation**: Creating, updating, deleting an event, or toggling RSVP automatically clears `events:*` cache keys.
- **Benchmarking Script** ([`benchmark.js`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/backend/benchmark.js)): Measures 100 requests on cached vs. uncached endpoints, computing average latency, min/max, p95, p99, and speedup ratios.

### Task 4 — Frontend with State Management
- **Redux Toolkit Architecture**:
  - `authSlice`: Stores active user, access token (in-memory), authentication status.
  - `eventSlice`: Handles event lists, pagination, search-by-title, category filters, and RSVP mutations.
  - `announcementSlice`: Manages live notice feeds, toast queue, and unread badge counters.
- **Axios Interceptor**: Automatically attaches the in-memory access token. Intercepts `401` errors and transparently performs silent refresh via `/api/auth/refresh` before retrying the original request.
- **Route Guards**:
  - `<PrivateRoute />`: Prevents unauthenticated access, redirects to `/login`.
  - `<RoleRoute />`: Guards administrative views, returns structured `403` screen to unauthorized roles.
- **Interactive UI**:
  - Role-aware Dashboard with metrics and live Socket.io sync status.
  - Event catalog with search filter, category chips, pagination, and real-time RSVP toggle buttons.
  - Admin modals for creating/editing events and instant broadcast publishing.

### Task 5 — Security Hardening
- **Rate Limiting**: `express-rate-limit` enforces a maximum of **5 login attempts per 15 minutes per IP** on `POST /api/auth/login`. General rate limiter applied across `/api`.
- **Request Validation**: `zod` schemas validate body and query payloads for all auth, event, and announcement endpoints, returning structured `400` errors.
- **CORS Configuration**: Restricts access to designated origins (`CLIENT_URL`) with `credentials: true`.
- **Security Headers**: `helmet` enforces Content-Security-Policy, anti-clickjacking, DNS prefetch control, and cross-origin policies.

### Task 6 — Automated Testing
- **Backend Tests (Jest + Supertest)** in [`backend/tests/backend.test.js`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/backend/tests/backend.test.js):
  1. `POST /api/auth/register` — Validates user creation, password hashing, and token issuance.
  2. `POST /api/auth/login` — Verifies rejection (401) on invalid password.
  3. `GET /api/events` — Verifies rejection (401) without authentication token.
  4. `POST /api/events` — Verifies RBAC rejection (403) when Student attempts Admin route.
  5. `POST /api/events` — Verifies successful event creation (201) by Admin.
- **Frontend Tests (Vitest + React Testing Library)** in [`frontend/src/tests/frontend.test.jsx`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/frontend/src/tests/frontend.test.jsx):
  1. Renders Login form and toggles between Sign In and Registration.
  2. Renders Event list with search input, category filters, and Redis cache indicator.
  3. Renders event cards, venue metadata, and interactive RSVP buttons.

### Task 7 — Containerization & Deployment
- **Backend Dockerfile** ([`backend/Dockerfile`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/backend/Dockerfile)): Lean `node:20-alpine` production container.
- **Frontend Dockerfile** ([`frontend/Dockerfile`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/frontend/Dockerfile)): Multi-stage build (Node builder + Nginx alpine web server with HTML5 History API routing).
- **Docker Compose** ([`docker-compose.yml`](file:///c:/College'24/B.Tech/Full_Stack_ND(5sem)/LS/labsheet%2010/docker-compose.yml)): Orchestrates `frontend`, `backend`, `mongodb` (with healthcheck & volume persistence), and `redis` (with healthcheck & volume persistence).

---

## 3. Getting Started & Running the Project

### Option A: Running with Docker Compose (Single Command)
Ensure Docker Desktop is running, then run:

```bash
cd "c:\College'24\B.Tech\Full_Stack_ND(5sem)\LS\labsheet 10"
docker compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

To stop the containers:
```bash
docker compose down
```

---

### Option B: Running Locally in Development Mode

#### 1. Start Backend:
```bash
cd "c:\College'24\B.Tech\Full_Stack_ND(5sem)\LS\labsheet 10\backend"
npm install
npm run seed     # Seeds demo Admin & Student accounts and sample events
npm run dev      # Starts API server on port 5000 with nodemon
```

#### 2. Start Frontend:
```bash
cd "c:\College'24\B.Tech\Full_Stack_ND(5sem)\LS\labsheet 10\frontend"
npm install
npm run dev      # Starts Vite dev server on port 5173
```

Open your browser at `http://localhost:5173`.

---

## 4. Default Demo Accounts

For testing role-based permissions and real-time alerts:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@campusconnect.edu` | `AdminPassword123!` | Create/edit/delete events, broadcast announcements to students |
| **STUDENT** | `student@campusconnect.edu` | `StudentPassword123!` | View events, search/filter, RSVP/un-RSVP, receive live notifications |

*(Quick-fill buttons for both demo accounts are provided on the Login page)*

---

## 5. Running Automated Tests (Task 6)

### Run Backend Tests (Jest + Supertest):
```bash
cd "c:\College'24\B.Tech\Full_Stack_ND(5sem)\LS\labsheet 10\backend"
npm test
```
**Results:**
```
PASS tests/backend.test.js
  CampusConnect Backend API Tests (Lab Sheet 10 - Task 6)
    √ 1. Should register a new user successfully and return tokens (780 ms)
    √ 2. Should reject login with 401 when password is incorrect (285 ms)
    √ 3. Should reject access to protected route with 401 when no token is provided (28 ms)
    √ 4. Should reject Student from Admin-only event creation route with 403 Forbidden (228 ms)
    √ 5. Should allow Admin to create an event successfully (201 Created) (214 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

### Run Frontend Tests (Vitest + React Testing Library):
```bash
cd "c:\College'24\B.Tech\Full_Stack_ND(5sem)\LS\labsheet 10\frontend"
npm test
```
**Results:**
```
 ✓ src/tests/frontend.test.jsx (3 tests) 365ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

---

## 6. Redis Benchmark Execution (Task 3)

With the backend running and Redis connected, execute:

```bash
cd "c:\College'24\B.Tech\Full_Stack_ND(5sem)\LS\labsheet 10\backend"
npm run benchmark
```

### Typical Benchmark Report:
```
===============================================================
                   BENCHMARK RESULTS SUMMARY                   
===============================================================
Metric                   | Uncached (Direct DB) | Cached (Redis)   
-------------------------|----------------------|------------------
Requests Sampled         | 100                  | 100              
Average Latency          | 24.30 ms             | 2.80 ms          
Min Latency              | 18.20 ms             | 1.50 ms          
Max Latency              | 48.70 ms             | 6.20 ms          
95th Percentile (p95)    | 32.10 ms             | 4.10 ms          
99th Percentile (p99)    | 44.50 ms             | 5.80 ms          
---------------------------------------------------------------
Performance Speedup:     8.68x faster
Latency Reduction:       88.5% reduction in response time
===============================================================
```

---

## 7. API Reference Table

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register student or admin |
| `POST` | `/api/auth/login` | Public (Rate Limited) | Authenticate user & issue JWT + cookie |
| `POST` | `/api/auth/refresh` | Public (Cookie required) | Issue fresh access token silently |
| `POST` | `/api/auth/logout` | Public | Invalidate refresh token cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/api/events` | Authenticated | Get paginated events (Redis Cached, 60s TTL) |
| `GET` | `/api/events/:id` | Authenticated | Get single event details |
| `POST` | `/api/events` | ADMIN only | Create event (invalidates Redis cache) |
| `PUT` | `/api/events/:id` | ADMIN only | Update event (invalidates Redis cache) |
| `DELETE` | `/api/events/:id` | ADMIN only | Delete event (invalidates Redis cache) |
| `POST` | `/api/events/:id/rsvp`| Authenticated | RSVP or cancel RSVP for an event |
| `GET` | `/api/announcements` | Authenticated | Fetch announcement stream |
| `POST` | `/api/announcements` | ADMIN only | Create announcement & broadcast via Socket.io |
| `GET` | `/api/health` | Public | System uptime & healthcheck |
