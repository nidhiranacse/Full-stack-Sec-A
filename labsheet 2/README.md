# Student Records REST API (Practical A1)

## Run
```bash
npm install
npm start
```

Server: `http://localhost:3000`

## Endpoints
- `POST /students` — body: `{ "name": "Asha", "email": "asha@example.com", "age": 20 }`
- `GET /students`
- `GET /students?minAge=18`
- `GET /students/:id`
- `DELETE /students/:id`

Data is stored in memory and resets when the server restarts.
