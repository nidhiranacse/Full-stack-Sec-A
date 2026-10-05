# CampusConnect — Student Event & Resource Management Portal
### Full-Stack Web Application • Lab Sheet 11

---

## 1. Project Overview & Architecture

**CampusConnect** is a full-stack collegiate portal covering:
- **Student Event Browsing & Registration** — live seat counters, category filters
- **Academic Resource Downloads** — notes, PYQs, lab manuals by semester
- **Admin Management** — event CRUD, file uploads, student roster analytics
- **JWT + RBAC Auth** — bcrypt hashing, role-based route guards
- **Bonus Features** — rate limiting, 5 unit tests, CI pipeline, query indexing benchmark

```
                ┌──────────────────────────────────────────┐
                │          React Frontend (Vite)           │
                │  Context API • React Router • Axios      │
                └──────────────┬───────────────────────────┘
                               │ HTTP REST + JWT Bearer
                               ▼
                ┌──────────────────────────────────────────┐
                │        Node.js + Express API             │
                │  Helmet • Zod Validation • RBAC Guard   │
                │  Express-Rate-Limit • Multer Upload      │
                └──────────────┬───────────────────────────┘
                               │ Mongoose ODM
                               ▼
                ┌──────────────────────────────────────────┐
                │  MongoDB (Local / Atlas / In-Memory)     │
                │  Compound Indexes + Text Search          │
                └──────────────────────────────────────────┘
```

---

## 2. ER Diagram (Entity Relationships)

```
Users (id, name, email, password[hash], role, studentId, department, semester)
  │
  │── creates ──► Events (id, title, description, category, date, time, venue,
  │                        maxSeats, registeredCount, organizer, speaker, createdBy)
  │
  └── registers ──► Registrations (id, event→Events, student→Users, status, registeredAt)

Users (admin)
  └── uploads ──► Resources (id, title, description, subject, semester, category,
                              fileUrl, fileName, fileSize, fileType, downloads, uploadedBy)
```

---

## 3. Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, React Router v6, Axios, Lucide Icons, Vite |
| Backend    | Node.js, Express.js (ES Modules)                |
| Database   | MongoDB + Mongoose ODM                          |
| Auth       | JWT (jsonwebtoken) + bcryptjs (10 rounds)        |
| Validation | Zod schema validators                           |
| Uploads    | Multer (disk storage, 15MB limit)               |
| Security   | Helmet, express-rate-limit, CORS                |
| Testing    | Jest + Supertest + mongodb-memory-server        |
| CI         | GitHub Actions (`.github/workflows/ci.yml`)     |

---

## 4. Functional Modules

### Authentication
- `POST /api/auth/register` — Student or Admin sign-up (bcrypt password hashing)
- `POST /api/auth/login` — JWT token issuance (rate-limited to 5 attempts/15 min)
- `GET  /api/auth/me` — Authenticated user profile

### Events
- `GET    /api/events` — Browse with search, category filter, date filter, pagination
- `POST   /api/events` — Create event *(Admin only)*
- `PUT    /api/events/:id` — Update event *(Admin only)*
- `DELETE /api/events/:id` — Delete event + cascade registrations *(Admin only)*
- `POST   /api/events/:id/register` — Student registration with live seat decrement
- `POST   /api/events/:id/unregister` — Cancel registration with seat restore
- `GET    /api/events/:id/attendees` — Full student roster *(Admin only)*

### Resources
- `GET    /api/resources` — Browse with search, semester, category filter, pagination
- `GET    /api/resources/meta` — Distinct subjects, semesters, categories
- `POST   /api/resources` — Upload PDF/DOCX file *(Admin only, multipart/form-data)*
- `GET    /api/resources/:id/download` — Download file (increments counter)
- `DELETE /api/resources/:id` — Delete resource *(Admin only)*

### Dashboard
- `GET /api/dashboard/student` — My registrations, upcoming/past split, recommended resources
- `GET /api/dashboard/admin` — Analytics (total events, registrations, occupancy %), event roster, recent sign-ups

---

## 5. Setup & Running Locally

### Prerequisites
- Node.js 20+
- MongoDB (running locally on port 27017, or Atlas URI in `.env`)

### Backend
```bash
cd "LS/labsheet 11/backend"
npm install
cp .env.example .env      # Edit MONGO_URI and JWT_SECRET

# Seed demo data (optional)
npm run seed

# Start dev server
npm run dev
# → http://localhost:5000/api/health
```

### Frontend
```bash
cd "LS/labsheet 11/frontend"
npm install
npm run dev
# → http://localhost:5173
```

---

## 6. Demo Credentials (after running seed)

| Role    | Email                          | Password      |
|---------|--------------------------------|---------------|
| Admin   | admin@campusconnect.edu        | Admin@123     |
| Student | student@campusconnect.edu      | Student@123   |

---

## 7. Bonus Implementations

### ✅ Rate Limiting on Login API
`express-rate-limit` — 5 requests per 15 minutes per IP on `POST /api/auth/login`.

### ✅ Role-Based Access Control Middleware
`src/middleware/role.js` — `authorize(...roles)` factory applied to all admin routes.

### ✅ 5 Unit Tests (Jest + Supertest)
Run with: `npm test` inside `backend/`
1. JWT issuance on valid student login
2. RBAC 403 rejection when student hits admin route
3. Admin event creation with seat capacity
4. Student registration → seat count decrement
5. Duplicate registration prevention + cancellation restores seat

### ✅ CI Pipeline (GitHub Actions)
`.github/workflows/ci.yml` — runs on push/PR to main:
- Backend tests (Jest/Supertest)
- Frontend production build validation (Vite)

### ✅ Query Indexing Optimization (Bonus)
Run: `npm run optimize` inside `backend/`

**Before Indexing:**
| Stage  | Docs Examined | Docs Returned | Time |
|--------|---------------|---------------|------|
| COLLSCAN | 6,000       | 231           | 4 ms |

**After Compound Index `{ category: 1, date: 1 }`:**
| Stage | Docs Examined | Docs Returned | Time |
|-------|---------------|---------------|------|
| IXSCAN | 231          | 231           | <1ms |

**Result:** 96.15% reduction in documents scanned — O(N) → O(log N) B-Tree traversal.

---

## 8. API Postman Collection
Import `CampusConnect_API.postman_collection.json` into Postman.
Set `baseUrl` variable to `http://localhost:5000/api`.

---

## 9. Deployment (Bonus)

| Service    | Platform                |
|------------|-------------------------|
| Frontend   | Vercel / Netlify        |
| Backend    | Render / Railway        |
| Database   | MongoDB Atlas           |

Docker Compose stack (local): `docker-compose up --build`
