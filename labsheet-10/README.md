# CampusConnect — Full Stack Event & Announcement Portal
### Full Stack Development · Lab Sheet 10 Implementation

---

## 📌 1. Project Overview & Problem Statement

**CampusConnect** is a robust, production-grade, role-based event and announcement portal engineered for colleges and universities. It enables university administrators to coordinate events and broadcast instant announcements, while allowing students to discover upcoming campus activities, RSVP in real-time, and receive live notifications without requiring page refreshes.

The system incorporates:
- **JWT Authentication & RBAC** (Admin vs. Student roles) with 15-minute access tokens and 7-day httpOnly refresh cookies.
- **Real-Time Bidirectional WebSockets (Socket.io)** pushing live announcements to connected student sockets with unread badge counters and pop-up toasts.
- **Server-Side Redis Caching** for `GET /api/events` with 60-second TTL and automatic cache invalidation on event mutations.
- **Security Hardening**: IP rate limiting (5 attempts / 15 min), Zod request schema validation returning structured 400 errors, Helmet HTTP headers, and strict CORS configuration.
- **Modern React Frontend**: In-memory token persistence, Axios interceptors with silent token refresh, global Context state management, role-aware dashboard, pagination, search, and RSVP functionality.
- **Containerization**: Multi-stage Dockerfiles and `docker-compose.yml` orchestrating Frontend (Nginx), Backend (Node.js), MongoDB, and Redis.
- **Automated Tests**: Unit and integration tests for backend (Jest + Supertest) and frontend components (React Testing Library + Vitest).

---

## 🗂️ 2. Repository & Folder Structure

```
d:/Afroj/full stack/labsheet-10/
├── backend/
│   ├── benchmark/
│   │   ├── benchmark.js              # Task 3: 100-request Node.js cache benchmark
│   │   └── benchmark.py              # Task 3: 100-request Python benchmark (uses active venv)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection with Mongoose
│   │   │   └── redis.js              # Resilient Redis connection & cache invalidator
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, Refresh, Logout, Me
│   │   │   ├── eventController.js    # Event CRUD, 60s Redis cache, RSVP toggle
│   │   │   └── announcementController.js # Announcements & Socket.io broadcast
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # authenticate (401) and authorize(role) (403)
│   │   │   ├── rateLimiter.js        # express-rate-limit (max 5 attempts / 15 min)
│   │   │   └── validate.js           # Zod body validation middleware
│   │   ├── models/
│   │   │   ├── User.js               # name, email, passwordHash, role (ADMIN/STUDENT)
│   │   │   ├── Event.js              # title, description, date, location, capacity, rsvps
│   │   │   └── Announcement.js       # title, content, priority, category, createdBy
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth routes
│   │   │   ├── eventRoutes.js        # /api/events routes
│   │   │   └── announcementRoutes.js # /api/announcements routes
│   │   ├── sockets/
│   │   │   └── socketHandler.js      # Socket.io JWT authentication & role rooms
│   │   ├── validators/
│   │   │   └── schemas.js            # Zod validation schemas
│   │   ├── app.js                    # Express app with Helmet, CORS, CookieParser
│   │   ├── server.js                 # HTTP + Socket.io server bootstrap
│   │   └── seed.js                   # Database seeder with sample events and users
│   ├── tests/
│   │   └── backend.test.js           # 9 Jest & Supertest integration tests
│   ├── .dockerignore
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile                    # Node 20 alpine production image
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js      # In-memory token storage & 401 refresh interceptor
│   │   ├── components/
│   │   │   ├── AnnouncementModal.jsx # Admin modal to broadcast live announcement
│   │   │   ├── EventModal.jsx        # Admin modal to create/update events
│   │   │   ├── Navbar.jsx            # Live WebSocket status, badge counter, dropdown
│   │   │   ├── NotificationToast.jsx # Live toast popup for announcements
│   │   │   ├── PrivateRoute.jsx      # Protected route wrapper
│   │   │   └── RoleRoute.jsx         # Role-based route wrapper (403 access control)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global authentication state & silent session restore
│   │   │   └── SocketContext.jsx     # Socket.io connection & real-time notification state
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx     # Role-aware dashboard, search, pagination, RSVP
│   │   │   ├── LoginPage.jsx         # Login with demo fast-fill & rate-limit feedback
│   │   │   └── RegisterPage.jsx      # Register with role selection (ADMIN/STUDENT)
│   │   ├── tests/
│   │   │   ├── EventList.test.jsx    # React Testing Library event filter tests
│   │   │   ├── LoginForm.test.jsx    # React Testing Library login form tests
│   │   │   └── setup.js              # Jest-DOM matchers setup
│   │   ├── App.jsx                   # React Router routes and providers
│   │   ├── index.css                 # Theme variables and animations
│   │   └── main.jsx
│   ├── .dockerignore
│   ├── Dockerfile                    # Multi-stage build (Node build -> Nginx alpine)
│   ├── nginx.conf                    # Nginx reverse proxy configuration
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── activate_and_run.ps1              # Activates user's Python venv from ..\venv
├── activate_and_run.bat              # Batch activator for Windows CMD
├── docker-compose.yml                # 4-tier orchestration (Frontend, Backend, Mongo, Redis)
├── package.json                      # Unified root management script runner
└── README.md
```

---

## 🚀 3. Quick Start & Setup

### A. Activating the Python Virtual Environment
The user's virtual environment at `..\venv` (`D:\Afroj\full stack\venv`) is integrated and can be activated via:

**PowerShell:**
```powershell
.\activate_and_run.ps1
```

**CMD:**
```cmd
activate_and_run.bat
```

---

### B. Seeding Initial Demo Data
To populate the database with default Admin and Student accounts, along with 6 campus events and announcements:
```powershell
npm run seed
```

**Demo Credentials:**
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@campus.edu` | `AdminPassword123` | Create/Edit/Delete events, Broadcast live announcements |
| **STUDENT** | `student@campus.edu` | `StudentPassword123` | View events, Search, RSVP, Receive real-time alerts |

---

### C. Running Locally for Development

1. **Start Backend API (Port 5000):**
```powershell
npm run dev:backend
```

2. **Start Frontend (Port 5173):**
```powershell
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

---

### D. Running with Docker Compose (Task 7)
To launch all 4 services (Frontend, Backend, MongoDB, Redis) in isolated containers:
```powershell
npm run docker:up
# or
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

---

## 📋 4. Detailed Task Implementations

### Task 1 — Authentication & Role-Based Access Control (RBAC)
- **User Schema**: Fields `name`, `email` (unique, lowercase), `passwordHash` (bcrypt hashed with min 10 rounds), `role` (`'ADMIN'` or `'STUDENT'`).
- **Access & Refresh Tokens**:
  - `POST /api/auth/register` and `POST /api/auth/login` issue a signed JWT access token (15-minute expiry) in JSON response.
  - A refresh token (7-day expiry) is issued inside an `httpOnly` secure cookie (`SameSite: Lax`).
- **Middleware**:
  - `authenticate`: Extracts Bearer token from `Authorization` header, verifies signature, and attaches `req.user`. Returns structured `401 Unauthorized` if invalid or missing.
  - `authorize(...roles)`: Verifies role membership. Admin-only endpoints reject Student accounts with `403 Forbidden`.
- **Silent Refresh**:
  - `POST /api/auth/refresh` reads the httpOnly cookie and issues a new access token without requiring re-login.

---

### Task 2 — Real-Time Notifications
- **Socket.io Server**: Mounted on HTTP server, authenticating handshake connections via JWT tokens (`socket.handshake.auth.token`).
- **Role-Based Rooms**: Students automatically join the `'STUDENT'` room on connection.
- **Instant Broadcast**: When an Admin posts an announcement via `POST /api/announcements`, the backend emits a `new-announcement` event to the `'STUDENT'` room.
- **Frontend Real-Time UI**:
  - Live toast notification appears immediately upon receiving the event.
  - Unread badge counter increments on the navigation bell icon without page reload.
  - Automatic reconnection handling with visual status indicator.

---

### Task 3 — Redis Caching Layer & Benchmarking
- **Caching Mechanism**: `GET /api/events` responses are cached in Redis with a 60-second TTL (`events:page=X:limit=Y:...`).
- **Automatic Cache Invalidation**: Any creation (`POST`), update (`PUT`), or deletion (`DELETE`) of an event immediately invalidates all matching Redis cache keys (`events:*`).
- **Benchmarking (100 Requests)**:

#### Benchmark Results Report (100 Requests Sample):
```
================================================================
  CampusConnect - Task 3: Redis Caching Layer Benchmark
  Target: http://localhost:5000/api/events
  Sample size: 100 requests per scenario
================================================================

 Metric              | Uncached (MongoDB) | Cached (Redis/Cache)
----------------------------------------------------------------
 Average (Mean) Time |           7.31 ms |            1.99 ms
 Min Latency         |           3.91 ms |            1.02 ms
 Max Latency         |          43.41 ms |            6.68 ms
 Median (P50)        |           5.72 ms |            1.88 ms
 90th Percentile     |           9.44 ms |            3.11 ms
 99th Percentile     |          43.41 ms |            6.68 ms
----------------------------------------------------------------
 PERFORMANCE GAIN:   Cached is 72.8% FASTER (3.68x speedup)
================================================================
```

To run the benchmark yourself:
```powershell
# Node.js runner:
npm run benchmark

# Python runner (inside activated venv):
npm run benchmark:py
```

---

### Task 4 — Frontend with State Management
- Built with **React 18 + Vite**.
- **Global Auth & Event State**: Managed via `AuthContext` + `useReducer` and `SocketContext`.
- **In-Memory Token Persistence**: The JWT access token is kept in memory (never written to insecure `localStorage`) and automatically attached via an **Axios request interceptor**.
- **Silent Refresh Interceptor**: If an API call receives a 401 error, the response interceptor automatically invokes `/api/auth/refresh` using the `httpOnly` cookie and replays the original request seamlessly.
- **Role-Aware Dashboard**:
  - Admin view: Create, edit, and delete events; broadcast instant announcements.
  - Student view: Search events by title, filter by category, paginate through events, toggle RSVP.

---

### Task 5 — Security Hardening
- **Login Rate Limiting**: `express-rate-limit` limits the login route to **5 attempts per 15 minutes** per IP, returning HTTP `429 Too Many Requests`.
- **Request Body Validation**: Implemented with **Zod** across registration, login, event, and announcement routes, returning structured `400 Bad Request` responses:
  ```json
  {
    "error": "Validation Error",
    "message": "Invalid request body parameters",
    "details": [
      { "field": "email", "message": "Invalid email address format" }
    ]
  }
  ```
- **CORS Configuration**: Restricts origins strictly to configured frontend hosts (`http://localhost:5173`, `http://localhost:3000`) with `credentials: true`.
- **Helmet**: Injects security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.).

---

### Task 6 — Automated Testing

#### Backend Tests (Jest + Supertest):
```powershell
npm run test:backend
```
Coverage (9 passing tests):
1. `POST /api/auth/register` creates user and returns tokens (201).
2. `POST /api/auth/login` rejects wrong passwords with 401.
3. Protected route (`POST /api/events`) rejects unauthenticated requests with 401.
4. Admin-only route (`POST /api/events`) rejects students with 403 Forbidden.
5. Admin-only route creates events successfully with 201.
6. `POST /api/auth/refresh` issues fresh access token from httpOnly cookie.
7. `GET /api/events` serves cached responses with cache headers.
8. `POST /api/events/:id/rsvp` toggles student RSVP attendance.

#### Frontend Tests (React Testing Library + Vitest):
```powershell
npm run test:frontend
```
Coverage (5 passing tests):
1. Renders login form inputs and submit button.
2. Updates email and password inputs as user types.
3. Fast-fill demo buttons populate credentials.
4. Renders event cards with title, description, and location.
5. Filters event list when user types in search input.

---

### Task 7 — Containerization & Deployment
- **Backend Dockerfile**: Lightweight `node:20-alpine` production image.
- **Frontend Dockerfile**: Multi-stage build with Vite build stage and Nginx alpine serving static assets with reverse-proxy rules.
- **Docker Compose**: Orchestrates `frontend`, `backend`, `mongodb`, and `redis` with health checks, environment variables, named persistence volume (`campusconnect-mongo-data`), and custom bridge network (`campusconnect-network`).
