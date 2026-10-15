# Practical A1: Student Records REST API (Node.js and Express)

## Aim
To develop a REST API using Node.js and Express that creates, lists, fetches and deletes student records with input validation.

---

## Requirements & Implementation Mapping

| Endpoint | Method | Status | Request Body / Query | Success Response | Error Conditions |
|---|---|---|---|---|---|
| `/students` | `POST` | `201 Created` | `{ name, email, age }` | `{ id, name, email, age }` | `400` Invalid input<br>`409` Email already exists |
| `/students` | `GET` | `200 OK` | `?minAge=<number>` (optional) | Array of students in insertion order | `[]` if none match |
| `/students/:id` | `GET` | `200 OK` | Route parameter `:id` | Student object | `404` Student not found |
| `/students/:id` | `DELETE` | `204 No Content` | Route parameter `:id` | Empty body | `404` Student not found |

### Core Guarantees:
- **Auto-Incrementing IDs:** IDs begin at `1` and increment by `1` with every newly created student.
- **ID Non-Reuse:** IDs of deleted students are never reused.
- **Strict Validation:** Missing or invalid fields (empty name, malformed email, non-positive integer age) trigger `400 { "error": "Invalid input" }`.
- **Case-Insensitive Email Uniqueness:** Attempting to register an existing email (irrespective of case) returns `409 { "error": "Email already exists" }`.

---

## Project Structure
```
Practical A1 - Student Records REST API/
├── src/
│   ├── app.js               # Express app instance and route controllers
│   └── studentStore.js      # In-memory store, validation, and auto-increment engine
├── tests/
│   └── api.test.js          # 15 automated test cases covering 100% of requirements
├── server.js                # Server entry point
├── package.json             # NPM package specification & test runner
├── postman_collection.json  # Exported Postman collection for API verification
└── README.md                # Documentation & Guide
```

---

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will run at `http://localhost:3000`.

### 3. Run Automated Tests
```bash
npm test
```

### Test Results
```text
✔ Practical A1: Student Records REST API Test Suite (84ms)
  ✔ 1. POST /students - Creation & Validation
    ✔ Valid input responds 201 with created student and auto-increment ID starting at 1
    ✔ Invalid input: missing name responds 400 with { "error": "Invalid input" }
    ✔ Invalid input: empty string name responds 400 with { "error": "Invalid input" }
    ✔ Invalid input: invalid email format responds 400 with { "error": "Invalid input" }
    ✔ Invalid input: non-numeric or negative age responds 400 with { "error": "Invalid input" }
    ✔ Duplicate email responds 409 with { "error": "Email already exists" }
    ✔ Duplicate email check is case-insensitive
  ✔ 2. GET /students - Fetch List & Query Filtering
    ✔ Responds 200 with an empty array when no students exist
    ✔ Responds 200 with all students in insertion order
    ✔ Query minAge filters students with age >= minAge
  ✔ 3. GET /students/:id - Fetch Single Student
    ✔ Responds 200 with student object when found
    ✔ Responds 404 with { "error": "Student not found" } when ID does not exist
  ✔ 4. DELETE /students/:id - Deletion & ID Non-Reuse Guarantee
    ✔ Responds 204 with empty body when deleting an existing student
    ✔ Responds 404 with { "error": "Student not found" } when deleting non-existent ID
    ✔ Guarantees IDs of deleted students are NEVER reused
```

---

## Example cURL Requests

### 1. Create Student
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Payal Bisht", "email": "payal.bisht@example.com", "age": 21}'
```
Response (`201 Created`):
```json
{
  "id": 1,
  "name": "Payal Bisht",
  "email": "payal.bisht@example.com",
  "age": 21
}
```

### 2. Get All Students
```bash
curl http://localhost:3000/students
```

### 3. Filter by Minimum Age
```bash
curl http://localhost:3000/students?minAge=20
```

### 4. Fetch Student by ID
```bash
curl http://localhost:3000/students/1
```

### 5. Delete Student
```bash
curl -i -X DELETE http://localhost:3000/students/1
```
Response (`204 No Content`)
