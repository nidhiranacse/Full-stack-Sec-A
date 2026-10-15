# 🎓 CampusConnect – Student Event & Resource Management Portal

A full-stack web application to help college students discover and register for campus events (workshops, hackathons, seminars, placements) and download study resources.

---

## 📂 Project Structure

```
labsheet 11/
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT auth & role middleware
│   ├── routes/
│   │   ├── auth.js            # Register, Login, Profile
│   │   ├── events.js          # Event CRUD + search/filter
│   │   ├── registrations.js   # Register/unregister for events
│   │   ├── resources.js       # Upload/download resources
│   │   └── admin.js           # Dashboard stats & user list
│   ├── uploads/               # Uploaded resource files
│   ├── .env                   # Environment variables
│   ├── server.js              # Express server entry point
│   ├── package.json           # Dependencies
│   └── generate-hashes.js     # Bcrypt hash generator utility
├── frontend/
│   ├── css/
│   │   └── style.css          # Complete stylesheet
│   ├── js/
│   │   ├── api.js             # API helper functions
│   │   ├── auth.js            # Login/logout/session management
│   │   ├── pages.js           # All page renderers
│   │   ├── admin.js           # Admin panel functionality
│   │   └── app.js             # Router & global handlers
│   └── index.html             # Main HTML file
├── database/
│   └── campus_connect.sql     # SQL schema + sample data
├── postman/
│   └── CampusConnect_API.postman_collection.json
└── README.md
```

---

## 🛠 Tech Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JavaScript   |
| Backend     | Node.js, Express.js               |
| Database    | MySQL (SQL)                       |
| Auth        | JWT (jsonwebtoken) + bcrypt       |
| File Upload | Multer                            |

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v16 or later) – [Download](https://nodejs.org)
- **MySQL** (v5.7 or later) – [Download](https://dev.mysql.com/downloads/)

### Step 1: Setup Database

1. Open MySQL command line or MySQL Workbench
2. Run the SQL file to create the database, tables, and sample data:

```sql
source /path/to/labsheet 11/database/campus_connect.sql;
```

Or copy-paste the contents of `campus_connect.sql` into your MySQL client (e.g. phpMyAdmin or MySQL Workbench).
> 💡 *Note: The pre-configured sample admin and student accounts already have valid bcrypt hashes included in `campus_connect.sql`.*

### Step 2: Configure Environment

Edit `backend/.env` and set your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_connect
JWT_SECRET=campusconnect_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
```

### Step 3: Install Dependencies & Run

```bash
cd "labsheet 11/backend"
npm install
npm run dev    # Uses nodemon for auto-reload
# OR
npm start      # Plain node
```

### Step 4: Open the App

Visit **http://localhost:5000** in your browser.

---

## 🔐 Demo Accounts

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@campus.com    | admin123    |
| Student | aarav@student.com   | student123  |
| Student | priya@student.com   | student123  |
| Student | rohan@student.com   | student123  |
| Student | sneha@student.com   | student123  |

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint           | Description            | Auth   |
|--------|--------------------|------------------------|--------|
| POST   | /api/auth/register | Register new student   | No     |
| POST   | /api/auth/login    | Login (student/admin)  | No     |
| GET    | /api/auth/me       | Get current user       | Yes    |

### Events
| Method | Endpoint                      | Description                     | Auth   |
|--------|-------------------------------|---------------------------------|--------|
| GET    | /api/events                   | List events (search/filter/page)| No     |
| GET    | /api/events/:id               | Get single event                | No     |
| POST   | /api/events                   | Create event                    | Admin  |
| PUT    | /api/events/:id               | Update event                    | Admin  |
| DELETE | /api/events/:id               | Delete event                    | Admin  |
| GET    | /api/events/:id/registrations | Get event's registered students | Admin  |

### Registrations
| Method | Endpoint                       | Description                  | Auth    |
|--------|--------------------------------|------------------------------|---------|
| POST   | /api/registrations/:eventId    | Register for event           | Student |
| DELETE | /api/registrations/:eventId    | Unregister from event        | Student |
| GET    | /api/registrations/my-events   | Get student's registered events | Student |
| GET    | /api/registrations/check/:eventId | Check registration status | Yes     |

### Resources
| Method | Endpoint                      | Description              | Auth   |
|--------|-------------------------------|--------------------------|--------|
| GET    | /api/resources                | List resources (filter)  | No     |
| POST   | /api/resources                | Upload resource (file)   | Admin  |
| DELETE | /api/resources/:id            | Delete resource          | Admin  |
| GET    | /api/resources/download/:id   | Download resource file   | No     |

### Admin
| Method | Endpoint          | Description           | Auth  |
|--------|-------------------|-----------------------|-------|
| GET    | /api/admin/stats  | Dashboard statistics  | Admin |
| GET    | /api/admin/users  | List all students     | Admin |

### Utility
| Method | Endpoint     | Description    | Auth |
|--------|-------------|----------------|------|
| GET    | /api/health | Health check   | No   |

---

## 📊 Database Schema

### users
| Column     | Type         | Description           |
|------------|-------------|-----------------------|
| id         | INT (PK)     | Auto-increment ID     |
| name       | VARCHAR(100) | Full name             |
| email      | VARCHAR(150) | Unique email          |
| password   | VARCHAR(255) | Bcrypt hashed password|
| role       | ENUM         | 'student' or 'admin'  |
| created_at | TIMESTAMP    | Account creation time |

### events
| Column          | Type         | Description                 |
|-----------------|-------------|-----------------------------|
| id              | INT (PK)     | Auto-increment ID           |
| title           | VARCHAR(200) | Event title                 |
| description     | TEXT         | Full description            |
| category        | ENUM         | workshop/hackathon/seminar/etc |
| event_date      | DATE         | Event date                  |
| event_time      | TIME         | Event time                  |
| venue           | VARCHAR(200) | Location                    |
| total_seats     | INT          | Maximum capacity            |
| available_seats | INT          | Remaining seats             |
| created_by      | INT (FK)     | References users.id         |

### event_registrations
| Column        | Type      | Description              |
|---------------|-----------|--------------------------|
| id            | INT (PK)  | Auto-increment ID        |
| user_id       | INT (FK)  | References users.id      |
| event_id      | INT (FK)  | References events.id     |
| registered_at | TIMESTAMP | Registration timestamp   |
| UNIQUE        | -         | (user_id, event_id) pair |

### resources
| Column      | Type         | Description            |
|-------------|-------------|------------------------|
| id          | INT (PK)     | Auto-increment ID      |
| title       | VARCHAR(200) | Resource title         |
| description | TEXT         | Description            |
| category    | ENUM         | notes/pyq/assignment/etc |
| subject     | VARCHAR(100) | Subject name           |
| file_url    | VARCHAR(500) | File path on server    |
| file_name   | VARCHAR(200) | Original filename      |
| uploaded_by | INT (FK)     | References users.id    |

---

## ✨ Features

### Student Features
- ✅ Account registration & login
- ✅ Browse all campus events with search, filter by category, and pagination
- ✅ View event details with seat availability
- ✅ One-click event registration / unregistration
- ✅ Personal dashboard of registered events
- ✅ Download study resources (notes, PYQs, assignments)
- ✅ Profile page

### Admin Features
- ✅ Admin login with role-based access
- ✅ Dashboard with key statistics (events, students, registrations, resources)
- ✅ Add, edit, and delete events
- ✅ View students registered for each event
- ✅ Upload and delete study resources
- ✅ View all registered students
- ✅ Recent activity log

### Technical Features
- ✅ JWT authentication with role-based middleware
- ✅ Bcrypt password hashing
- ✅ Database transactions for seat management
- ✅ File upload with Multer (10MB limit, type validation)
- ✅ Client-side form validation
- ✅ Responsive design (mobile + desktop)
- ✅ Toast notifications for user feedback
- ✅ Dark theme with modern UI

---

## 🧪 Testing with Postman

1. Import the collection from `postman/CampusConnect_API.postman_collection.json`
2. Set the `base_url` variable to `http://localhost:5000/api`
3. Login first (Admin or Student) to get a JWT token
4. Copy the token and set the `token` variable
5. Test all endpoints!

---

## 📝 Notes

- The frontend is served as static files by Express (no separate frontend server needed)
- Uploaded resources are stored in `backend/uploads/`
- The sample data SQL has placeholder bcrypt hashes — run `generate-hashes.js` to get proper ones
- Event category options: workshop, hackathon, seminar, placement, cultural, sports, other
- Resource category options: notes, pyq, assignment, reference, other

---

**Built with ❤️ for Full Stack Web Development Lab**
