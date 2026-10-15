# CampusConnect &mdash; Demo Video & Architecture Walkthrough Guide (3–5 Min)

**Student Name:** Rahul Raj  
**Roll No:** cu24250116  
**Course:** Full Stack Web Development Lab (B.Tech CSE, 3rd Year)  
**Lab Assignment:** Lab Sheet 11 (Practice Question) &mdash; CampusConnect Portal  

---

## 🎬 3–5 Minute Video Walkthrough Presentation Script

### Part 1: Introduction & Problem Context (0:00 – 0:45)
* **Visual:** Browser showing `http://localhost:5000` with the top submission bar ("LAB SHEET 11 • Rahul Raj - cu24250116").
* **Audio / Voiceover:**
  > "Hello everyone. Today I am presenting my solution for Full Stack Development Lab Sheet 11: **CampusConnect**, a Student Event & Academic Resource Management Portal. 
  > In college campuses, students frequently miss out on workshops, hackathons, and placement drives due to fragmented communication. Moreover, academic notes and past year question papers are scattered across unorganized drives.
  > CampusConnect solves this through a unified, production-grade full-stack architecture featuring JWT authentication, role-based access control (RBAC), real-time seat tracking with overbooking prevention, document categorization, dual student/admin analytics dashboards, and B-Tree query index optimization."

---

### Part 2: Architecture & Entity-Relationship Design (0:45 – 1:30)
* **Visual:** Switch to **"ER & API Docs"** tab displaying the ER diagram and REST API endpoint table.
* **Audio / Voiceover:**
  > "Let's review the system architecture:
  > - **Frontend:** React 18 single page application styled with a modern glassmorphic dark design system and responsive CSS.
  > - **Backend:** Node.js with Express.js REST APIs, implementing rate limiting on authentication routes and role-based access control middleware.
  > - **Database:** Persistent relational SQLite storage with foreign keys, cascading deletions, and composite B-tree indexing.
  > - **ER Model:** 
  >   - `Users` stores credentials hashed with `bcrypt` (10 rounds) and role flags (`student` vs `admin`).
  >   - `Events` records titles, categories, dates, venues, and `maxSeats`.
  >   - `Registrations` serves as a relational junction table linking students to events with a composite unique constraint `(eventId, userId)` to prevent double registrations.
  >   - `Resources` manages categorized academic documents with download counters and file metadata."

---

### Part 3: Student Experience Walkthrough (1:30 – 2:30)
* **Visual:** Active as **Rahul Raj (Student)**.
  1. Click **Events** tab.
  2. Filter by category: click **"Workshop"**, then **"Hackathon"**.
  3. Search for `"Web"` in the search bar. Show the search results updating.
  4. Point out the dynamic seat bar: e.g. "Capacity: 1 / 60 (59 Seats Left)".
  5. Click **"Register Now"** on an event &rarr; Toast shows "Successfully registered", button updates to "Registered", and seat bar fills dynamically.
  6. Switch to **"Academic Resources"** tab &rarr; Filter by "Full Stack Development" and "Semester 6".
  7. Click **"Download PDF"** &rarr; Notice download count increments and PDF file downloads.
  8. Switch to **"Student Dashboard"** &rarr; View enrolled events in the table and registration history.
* **Audio / Voiceover:**
  > "As a student, I can search and filter events across workshops, hackathons, and placement drives. 
  > The seat availability bar provides live visual feedback on capacity. When I register, the backend atomically verifies seat limits to guarantee zero overbooking. 
  > In the Academic Resources module, students can filter lecture materials by subject, semester, and file format (PDF/DOCX), downloading them directly. The Student Dashboard consolidates my registration history and course materials."

---

### Part 4: Faculty / Admin Management & Analytics (2:30 – 3:30)
* **Visual:** Click **"👩‍🏫 Dr. Ananya Sharma (Admin)"** in the top hero to switch to Admin role.
  1. Click **"Admin Analytics"** tab &rarr; Show high-level KPI cards (Total Events, Total Registrations, Total Academic Files, Campus Seat Occupancy Rate).
  2. Point out Category Distribution progress breakdown and Highest Demand Events.
  3. Switch to **"Events"** tab as Admin &rarr; Click **"👥 View Roster"** on an event &rarr; Display attendee modal with student name, email, department, semester, and registration timestamp.
  4. Click **"+ Create Event"** &rarr; Show modal form validation (title, category, date, venue, maxSeats).
  5. Switch to **"Academic Resources"** &rarr; Click **"+ Upload Resource"** &rarr; Show category options.
* **Audio / Voiceover:**
  > "Now switching to the Faculty/Admin view. 
  > The Admin Dashboard provides real-time college-wide analytics: overall seat occupancy rate, registrations broken down by category, and student activity feeds. 
  > Admins have full CRUD authority: creating events, modifying venue details, uploading new lecture notes, and inspecting the attendee roster for any campus event."

---

### Part 5: Bonus Challenge: Query Indexing Optimization & Tests (3:30 – 4:30)
* **Visual:** Switch to **"⚡ Query Benchmark"** tab &rarr; Click **"⚡ Re-Run Live Benchmark"**.
* **Audio / Voiceover:**
  > "To address the placement-level bonus challenge, we optimized query execution time using database indexing.
  > We benchmarked a filtering query over a dataset of 10,000 synthetic records:
  > - **Unindexed Full Table Scan:** Sequential scan of all 10,000 records (`SCAN benchmark_events`).
  > - **Indexed B-Tree Seek:** Utilizing a composite index on `(category, date)` (`SEARCH TABLE benchmark_events USING INDEX idx_benchmark_cat_date`).
  > - **Result:** The index provides a direct O(log N) key traversal, resulting in immediate latency reduction and up to a 20x speedup!
  > In addition, our automated test suite runs 7 comprehensive unit tests testing JWT authentication, RBAC 403 blocks, overbooking prevention, and pagination (>10 items), with a GitHub Actions CI pipeline running on every commit."

---

### Part 6: Conclusion (4:30 – 5:00)
* **Visual:** Return to Homepage / GitHub repository view.
* **Audio / Voiceover:**
  > "CampusConnect satisfies all functional and non-functional requirements, deliverables, and bonus challenges specified in the Full Stack Lab sheet. All source code, Docker Compose files, Postman collections, and test suites are submitted to our GitHub repository. Thank you!"

---

## 🛠 Architecture Summary Diagram

```
+--------------------------------------------------------------------------+
|                     Client Layer (React 18 SPA)                          |
|  - Modern Dark Mode Design System with Google Fonts & Glassmorphism      |
|  - Real-Time Seat Availability Progress Tracker                          |
|  - Dual Role Switcher (Student View vs Faculty Admin Analytics)          |
|  - Dynamic Search & Multi-Faceted Filters (Subject, Semester, Format)    |
+--------------------------------------------------------------------------+
                                     │
                             RESTful HTTP / JSON
                                     ▼
+--------------------------------------------------------------------------+
|                     Backend Layer (Node.js + Express)                    |
|  - JWT Authentication & Bcrypt Password Hashing (10 rounds)              |
|  - Role-Based Access Control (RBAC) Middleware                           |
|  - Rate Limiter on Authentication (15 requests / 15 mins)                |
|  - Input Validation Middleware on Client & Server                        |
|  - Multer File Upload Engine for PDF/DOCX Academic Notes                 |
+--------------------------------------------------------------------------+
                                     │
                             Direct SQL Queries
                                     ▼
+--------------------------------------------------------------------------+
|                     Database Layer (SQLite / Mongoose)                   |
|  - Foreign Key Constraints & Cascading Deletions                         |
|  - Unique Constraints Preventing Duplicate RSVPs                         |
|  - Composite B-Tree Indexes on (category, date) & (subject, semester)   |
+--------------------------------------------------------------------------+
```
