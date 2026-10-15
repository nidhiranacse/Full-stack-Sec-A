# Student Record Management

A full-stack CRUD lab application using HTML, CSS, JavaScript, Express.js, and MongoDB with Mongoose.

## Run locally

1. Install Node.js and MongoDB.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and adjust `MONGODB_URI` if needed.
4. Start MongoDB.
5. Run `npm start` and open http://localhost:3000.

For development, use `npm run dev`.

## API

- `POST /students` creates a record.
- `GET /students` lists all records.
- `GET /students/:id` fetches one record.
- `PUT /students/:id` updates a record.
- `DELETE /students/:id` deletes a record.

Request bodies use `{ "name": "...", "rollNo": "...", "course": "...", "marks": 85 }`.
