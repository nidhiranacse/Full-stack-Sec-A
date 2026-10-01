# Project 2 - Student Record Management (Express + MongoDB + vanilla JS)

## Run
    npm install
    cp .env.example .env      # edit MONGO_URI if needed (needs MongoDB running locally or Atlas)
    npm start                 # open http://localhost:5000

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | /students | Add student |
| GET | /students | List all |
| GET | /students/:id | Get one |
| PUT | /students/:id | Update |
| DELETE | /students/:id | Delete |

Import `postman_collection.json` into Postman and set the `id` variable to test each endpoint
before using the UI (as the lab objectives require).
Validation: Roll No. required & unique (409 on duplicate), Marks 0-100 (checked on client and server).
