# CampusConnect

CampusConnect is a student event and study-resource portal. The project contains an Express API backed by SQLite and a React/Vite frontend.

## Requirements

- Node.js 20.19 or newer
- npm

## Install

Run these commands from the project root:

```bash
npm --prefix backend install
npm --prefix frontend install
```

The SQLite database and upload folders are created automatically when the backend starts. To load the sample users, events, and resources, run:

```bash
npm run seed
```

Seeding replaces the existing sample database contents.

## Run Locally

Start the backend and frontend in separate terminals from the project root.

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Open the frontend at <http://localhost:5173/>. The API runs at <http://localhost:5000>, and its health endpoint is <http://localhost:5000/api/health>.

By default, the frontend connects to `http://localhost:5000/api`. Set `VITE_API_URL` when the API is hosted elsewhere.

## Demo Accounts

Seed the database first, then sign in with either sample account:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@campusconnect.edu` | `Admin@123` |
| Student | `rahul.sharma@campusconnect.edu` | `Student@123` |

New accounts register as students. The admin account can create, edit, and delete events; students can register for events. Signed-in users can upload study resources, and admins or the resource owner can delete them.

## Project Commands

Run from the project root:

| Command | Description |
| --- | --- |
| `npm run dev:backend` | Start the API with automatic restart on file changes |
| `npm run dev:frontend` | Start the Vite development server |
| `npm run seed` | Replace the SQLite contents with sample data |
| `npm test` | Run the backend API tests |
| `npm run lint` | Lint the frontend |
| `npm run build` | Build the frontend for production |

The API stores its SQLite database in `backend/data/campusconnect.db` and uploaded files in `backend/uploads/`.