# Project 2: CampusConnect University Enterprise Portal

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Project Overview & System Features
**CampusConnect** is a comprehensive, production-grade university portal designed to unify student academics, campus events, and course study materials into a single responsive interface.

### Key Capabilities:
1. **Multi-Role RBAC (Role-Based Access Control):**
   - **Administrator:** Create/edit/delete events, manage university resources, inspect global enrollment statistics, and view event attendee rosters.
   - **Student:** Discover campus events, RSVP with instant capacity calculation, download course syllabus/notes, and monitor personal activity.
2. **File Upload & PDF Asset Management:**
   - Powered by `Multer` with strict MIME-type validation, size limits (up to 15MB), and secure file storage in `/uploads`.
3. **Database Indexing & Benchmark Engine (`benchmark-indexing.js`):**
   - Benchmark script populating 10,000 synthetic documents to demonstrate the dramatic performance leap of compound B-Tree indexes (e.g. from 120ms table scans down to 1.8ms indexed lookups).
4. **Automated CI/CD Pipeline:**
   - GitHub Actions workflow (`.github/workflows/ci.yml`) performing automated lint checks, integration tests, and build verification on push.
5. **Standardized Postman Collection:**
   - Includes `CampusConnect_API.postman_collection.json` with pre-configured requests and token environment variables.

---

## 2. RBAC Permissions Matrix

| Endpoint | Method | Public | Student | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| `/api/auth/register` & `/login` | `POST` | ✓ | ✓ | ✓ |
| `/api/events` | `GET` | ✓ | ✓ | ✓ |
| `/api/events` | `POST` | ✗ | ✗ | ✓ |
| `/api/events/:id/rsvp` | `POST` | ✗ | ✓ | ✓ |
| `/api/events/:id/attendees` | `GET` | ✗ | ✗ | ✓ |
| `/api/resources` | `GET` | ✓ | ✓ | ✓ |
| `/api/resources/upload` | `POST` | ✗ | ✗ | ✓ |
| `/api/dashboard/stats` | `GET` | ✗ | ✗ | ✓ |

---

## 3. How to Run Locally

### Backend Setup:
```bash
cd 11-Project-02-CampusConnect-Portal/backend
npm install
npm run seed              # Seeds initial Admin (admin@campus.edu) & Student (student@campus.edu)
npm start
```

### Run Indexing Benchmark:
```bash
node src/benchmark-indexing.js
```

### Frontend Setup:
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: How does compound indexing accelerate multi-field queries in MongoDB?
- In a query like `{ department: 'CSE', date: { $gte: ISODate() } }`, an unindexed search performs a collection scan (`COLLSCAN`), inspecting every document in the collection.
- A compound index `{ department: 1, date: 1 }` builds a sorted B-Tree ordered first by department, then by date. The database engine executes an index scan (`IXSCAN`), leaping directly to the matching nodes in O(log N) time.

### Q2: What security precautions are implemented for file uploads?
- **File Filter:** Only verified file types (PDF, PPT, DOCX) are permitted; executable files (.exe, .sh, .js) are rejected.
- **File Size Caps:** Upload size is limited to prevent denial-of-service disk flooding.
- **Unique Naming:** Files are renamed using timestamps and sanitized unique IDs to prevent path traversal and overwriting existing assets.
