# Student Record Management System — Full Stack Lab (BTCS303P)

A full-stack CRUD web app: HTML/CSS/JS frontend + Node.js/Express backend + MongoDB database.

## Folder Structure

```
student-record-management/
├── backend/
│   ├── models/
│   │   └── Student.js          # Mongoose schema (Name, Roll No., Course, Marks)
│   ├── routes/
│   │   └── studentRoutes.js    # 5 REST endpoints (POST/GET/GET:id/PUT/DELETE)
│   ├── server.js               # Express app entry point, connects to MongoDB
│   └── package.json            # Backend dependencies
├── frontend/
│   ├── index.html              # Form + table UI
│   ├── style.css               # Styling
│   └── script.js               # fetch()-based API calls, validation
└── README.md
```

## How to create this yourself from scratch (folders & files)

If you'd rather build it manually instead of using these files, here's exactly what to type:

```bash
mkdir student-record-management
cd student-record-management

mkdir backend frontend
cd backend
mkdir models routes
npm init -y
npm install express mongoose cors
npm install --save-dev nodemon

# create the empty files, then paste in the code
type nul > server.js                 # Windows
touch server.js                      # Mac/Linux
touch models/Student.js
touch routes/studentRoutes.js

cd ../frontend
touch index.html style.css script.js
```

## Setup & Run

### 1. Install MongoDB
Either install MongoDB Community Server locally (https://www.mongodb.com/try/download/community) and make sure `mongod` is running, **or** use a free MongoDB Atlas cluster and paste its connection string into `server.js` (`MONGO_URI`).

### 2. Start the backend
```bash
cd backend
npm install
npm run dev        # uses nodemon (auto-restart) — or `npm start`
```
You should see:
```
MongoDB connected successfully
Server running on http://localhost:5000
```

### 3. Open the frontend
Just open `frontend/index.html` directly in your browser (double-click it),
or serve it with VS Code's "Live Server" extension for auto-reload.

> The frontend calls `http://localhost:5000/students`, so keep the backend running while you use the page.

## Testing the API with Postman (before frontend integration)

| Method | URL | Body (JSON) |
|---|---|---|
| POST | http://localhost:5000/students | `{ "name":"Asha Rao","rollNo":"CS101","course":"BTech CSE","marks":88 }` |
| GET | http://localhost:5000/students | — |
| GET | http://localhost:5000/students/:id | — |
| PUT | http://localhost:5000/students/:id | `{ "marks": 95 }` |
| DELETE | http://localhost:5000/students/:id | — |

## What each part demonstrates (maps to the lab objectives)

- **Frontend ↔ Backend ↔ Database as one system** — `script.js` calls the Express routes, which use Mongoose to talk to MongoDB.
- **RESTful endpoints in Express.js** — see `routes/studentRoutes.js`.
- **CRUD via an ODM (Mongoose)** — `models/Student.js` defines the schema; `Student.create/find/findByIdAndUpdate/findByIdAndDelete` implement CRUD.
- **fetch + async/await** — every network call in `script.js` uses `async function` + `await fetch(...)`.
- **Client-side validation** — Roll No. required, Marks restricted to 0–100, checked before the request is sent.
- **Postman testing before frontend integration** — table above.

## Viva / Understanding Checklist

- Why is CORS needed here? (frontend and backend run on different origins/ports)
- What does `runValidators: true` do in the PUT route?
- What HTTP status codes are returned for success vs. validation errors vs. not-found?
- Difference between `findByIdAndUpdate` and `findOneAndUpdate`.
- Why validate both on the client (UX) and the server (security/data integrity)?
