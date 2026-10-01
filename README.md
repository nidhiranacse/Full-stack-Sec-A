# CampusConnect — Student Event & Resource Management Portal

A full-stack MERN application where students browse and register for campus events
(workshops, hackathons, placement drives) and access shared resources (notes, previous
year papers). Admins/faculty create and manage events and resources.

Built for: Full Stack Development Lab — B.Tech CSE, 3rd Year.

---

## Tech Stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Frontend   | React 18, React Router, Axios             |
| Backend    | Node.js, Express.js                       |
| Database   | MongoDB + Mongoose                        |
| Auth       | JWT + bcrypt                              |
| File upload| Multer (PDF/DOCX, 10MB limit)             |
| Testing    | Jest, Supertest, mongodb-memory-server    |
| CI         | GitHub Actions                            |

---

## Project Structure

```
campusconnect/
├── backend/
│   ├── app.js                # Express app (routes/middleware) — used by tests
│   ├── server.js             # Entry point: connects DB + starts server
│   ├── seed.js                # Demo data seeder
│   ├── config/db.js
│   ├── models/                # User, Event, Resource
│   ├── controllers/           # auth, event, resource, dashboard
│   ├── routes/
│   ├── middleware/            # auth (JWT + RBAC), upload (Multer), errorHandler
│   ├── tests/                 # Jest + Supertest test suite
│   └── uploads/                # Uploaded resource files (gitignored contents)
├── frontend/
│   └── src/
│       ├── api/axios.js       # Axios instance with auth interceptor
│       ├── context/AuthContext.js
│       ├── components/        # Navbar, PrivateRoute, Pagination
│       └── pages/              # Login, Register, Events, EventDetail, Resources,
│                                 StudentDashboard, AdminDashboard, AdminEvents, AdminResources
└── .github/workflows/backend-ci.yml
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env if needed (MONGO_URI, JWT_SECRET, etc.)

npm run seed     # optional: creates demo admin + student + sample events
npm run dev      # starts on http://localhost:5000 (nodemon)
```

Demo accounts created by `npm run seed`:
- **Admin:** `admin@campusconnect.test` / `Admin@123`
- **Student:** `student@campusconnect.test` / `Student@123`

### 2. Frontend

```bash
cd frontend
npm install
npm start        # starts on http://localhost:3000
```

The frontend proxies API calls to `http://localhost:5000/api` by default
(see `frontend/package.json` `"proxy"` field, or set `REACT_APP_API_URL`).

### 3. Run backend tests

```bash
cd backend
npm test
```

Uses an in-memory MongoDB instance (`mongodb-memory-server`) — no real database
needed to run tests. Covers registration/login, RBAC (students blocked from admin
actions), and seat-availability logic (9 tests total).

### 4. CI Pipeline

`.github/workflows/backend-ci.yml` runs `npm test` in the `backend/` folder on every
push/PR to `main` via GitHub Actions.

---

## ER Diagram

```
┌─────────────────────┐        ┌──────────────────────────┐
│        User          │        │          Event            │
├─────────────────────┤        ├──────────────────────────┤
│ _id                   │◄──┐    │ _id                        │
│ name                  │    │    │ title                       │
│ email (unique)        │    │    │ description                 │
│ password (hashed)     │    │    │ category                     │
│ role: student|admin   │    ├────┤ createdBy (ref User)         │
│ createdAt / updatedAt │    │    │ date                          │
└─────────────────────┘    │    │ venue                          │
          ▲                  │    │ totalSeats                     │
          │                  └────┤ registeredStudents[] (ref User)│
          │                       │ createdAt / updatedAt            │
          │                       └──────────────────────────┘
          │
          │                       ┌──────────────────────────┐
          │                       │        Resource             │
          │                       ├──────────────────────────┤
          └───────────────────────┤ uploadedBy (ref User)        │
                                  │ title                          │
                                  │ subject                        │
                                  │ semester                        │
                                  │ type: notes|previous-year-paper │
                                  │ fileName / filePath              │
                                  │ createdAt / updatedAt             │
                                  └──────────────────────────┘
```

Relationships:
- `Event.createdBy` → `User` (an admin creates many events)
- `Event.registeredStudents` → `User[]` (many-to-many: students register for many events, events have many students)
- `Resource.uploadedBy` → `User` (an admin uploads many resources)

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint            | Access  | Description                     |
|--------|----------------------|---------|----------------------------------|
| POST   | `/auth/register`     | Public  | `{ name, email, password, role? }` → `{ token, user }` |
| POST   | `/auth/login`        | Public  | Rate-limited (10/15min). `{ email, password }` → `{ token, user }` |
| GET    | `/auth/me`           | Private | Returns the logged-in user       |

### Events
| Method | Endpoint                        | Access        | Description |
|--------|----------------------------------|----------------|--------------|
| GET    | `/events?page=&limit=&search=&category=&dateFrom=&dateTo=` | Public | Paginated list |
| GET    | `/events/:id`                     | Public         | Single event detail |
| POST   | `/events`                          | Admin          | Create event |
| PUT    | `/events/:id`                      | Admin          | Update event |
| DELETE | `/events/:id`                      | Admin          | Delete event |
| POST   | `/events/:id/register`             | Student        | Register (fails if full or already registered) |
| POST   | `/events/:id/unregister`           | Student        | Unregister |
| GET    | `/events/:id/registrations`        | Admin          | List of registered students |
| GET    | `/events/my/history`               | Student        | Current student's registration history |

### Resources
| Method | Endpoint                                  | Access | Description |
|--------|---------------------------------------------|--------|--------------|
| GET    | `/resources?page=&limit=&search=&subject=&semester=&type=` | Public | Paginated list |
| POST   | `/resources` (multipart/form-data, field `file`) | Admin  | Upload PDF/DOCX |
| GET    | `/resources/:id/download`                    | Private | Download file  |
| DELETE | `/resources/:id`                              | Admin  | Delete resource |

### Dashboard
| Method | Endpoint            | Access  | Description |
|--------|----------------------|---------|--------------|
| GET    | `/dashboard/student` | Student | My registrations (upcoming/past), resource count |
| GET    | `/dashboard/admin`   | Admin   | Total events/registrations/resources/students, top events |

All error responses: `{ "message": "..." }` with an appropriate HTTP status code
(400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 500 server error).

---

## Postman Collection

Import the endpoints above into Postman manually, or generate a collection by pointing
Postman's "Import from OpenAPI/cURL" at the routes listed. (A ready-made
`campusconnect.postman_collection.json` can be added once you finalize any custom
fields — this README documents the exact request/response shapes needed to build one
quickly.)

---

## Bonus Features Implemented

- ✅ Role-based access control middleware (`middleware/auth.js` → `authorize()`)
- ✅ Rate limiting on the login API (`express-rate-limit`, 10 requests/15 min)
- ✅ 9 unit/integration tests (Jest + Supertest + mongodb-memory-server)
- ✅ CI pipeline (GitHub Actions) running tests on every push/PR
- ⚠️ Query optimization: `Event` and `Resource` models include text/field indexes
  (`title`, `subject`) for the search endpoints — benchmark before/after with your own
  dataset size using `.explain('executionStats')` in MongoDB shell.

## Notes / Next Steps for a Real Deployment

- Swap `JWT_SECRET` for a strong random value in production.
- Move uploaded files to cloud storage (S3/Cloudinary) instead of local disk before deploying to Render/Railway (their filesystems are ephemeral).
- Add HTTPS, helmet(), and stricter CORS origin in production.
- Deploy frontend to Vercel/Netlify, backend to Render/Railway, DB to MongoDB Atlas.
