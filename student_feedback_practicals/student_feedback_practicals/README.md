# Practical A1 and A2 — Student Records API + Feedback Form

This package contains two separate practicals:

- **A1:** Node.js + Express REST API for student records.
- **A2:** React feedback form with validation. It does not need a backend.

## Requirements
- Node.js 18+ and npm
- A web browser

---

## Practical A1 — Student Records REST API

### Files
`A1-student-api/server.js`, `A1-student-api/package.json`

### Run
Open a terminal in the `A1-student-api` folder and run:

```bash
npm install
npm start
```

The API runs at `http://localhost:3001`.

### Test examples

Create a student:

```bash
curl -X POST http://localhost:3001/students \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Aman Kumar\",\"email\":\"aman@example.com\",\"age\":20}"
```

List all students:

```bash
curl http://localhost:3001/students
```

Filter students aged 20 or above:

```bash
curl "http://localhost:3001/students?minAge=20"
```

Fetch student ID 1:

```bash
curl http://localhost:3001/students/1
```

Delete student ID 1:

```bash
curl -i -X DELETE http://localhost:3001/students/1
```

Run the automated tests (starts its own server on port 3099):

```bash
npm test
```

Status codes: `201` created, `200` OK, `204` deleted, `400` invalid input (bad body, bad `minAge`, malformed JSON), `404` not found, `409` duplicate email.

Data is stored in memory, so it resets when the server restarts. IDs are not reused during a server run.

---

## Practical A2 — React Feedback Form

### Files
`A2-feedback-react/package.json`, `index.html`, `src/main.jsx`, `src/FeedbackForm.jsx`, `src/style.css`

### Run
Open another terminal in the `A2-feedback-react` folder and run:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`.

### Validation
- Name is required.
- Email must be a valid email address.
- Rating must be selected from 1–5.
- Comment is optional and limited to 200 characters (live counter shown).
- Error messages only appear for invalid fields.
- On successful submission, the form shows `Thank you, {name}! Feedback submitted.`

Run the automated tests / production build:

```bash
npm test
npm run build
```

No Flask backend is needed for these requirements because A2 only asks for client-side form validation and a confirmation message.
