# Student Records REST API

A Node.js and Express practical project for managing student records in memory. The project includes a small browser dashboard for demonstrating the API; the REST endpoints remain available directly.

## Run

```powershell
npm.cmd install
npm.cmd start
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard. The API runs on port `3000` by default; set the `PORT` environment variable to use another port.

## API routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/students` | Create a record from `{ "name", "email", "age" }` |
| `GET` | `/students` | List students in insertion order |
| `GET` | `/students?minAge=18` | List students aged 18 or older |
| `GET` | `/students/:id` | Fetch one student |
| `DELETE` | `/students/:id` | Delete one student |

Names must not be blank, emails must be valid and unique, and age must be a positive integer. Duplicate email addresses return `409`; invalid input returns `400`; missing student IDs return `404`. New records return `201`, successful deletes return `204`, and IDs increase without being reused.

Data is stored in memory and is cleared when the server restarts.