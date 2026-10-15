# Practical B1: JWT Authentication API (Node.js & Express)

**Marks:** 5  
**Aim:** To implement user registration, login, and a protected route using JSON Web Tokens (JWT) in an Express application.

---

## 🛠️ Tech Stack & Dependencies
- **Node.js & Express**: API framework and route handling
- **jsonwebtoken (`jwt`)**: Token signing and verification
- **bcryptjs**: Secure password hashing and comparison
- **Jest & Supertest**: Automated test suite for all test cases

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will run on `http://localhost:3000`.

### 3. Run Automated Tests
```bash
npm test
```
Runs 14 automated tests covering all requirements, status codes, and error conditions.

---

## 📋 API Endpoints & Specifications

### 1. `POST /register`
Registers a new user.

- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "username": "alice",
    "password": "password123"
  }
  ```
- **Responses:**
  - **`201 Created`**:
    ```json
    { "message": "User registered" }
    ```
  - **`400 Bad Request`** (username missing or empty, or password shorter than 6 characters):
    ```json
    { "error": "Invalid input" }
    ```
  - **`409 Conflict`** (Username already taken):
    ```json
    { "error": "Username already exists" }
    ```

---

### 2. `POST /login`
Authenticates a user and issues a JWT token.

- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "username": "alice",
    "password": "password123"
  }
  ```
- **Responses:**
  - **`200 OK`**: (Token payload contains `username` and expires in 1 hour)
    ```json
    { "token": "<jwt-token-string>" }
    ```
  - **`401 Unauthorized`** (Unknown user or wrong password):
    ```json
    { "error": "Invalid credentials" }
    ```

---

### 3. `GET /profile`
Protected route to retrieve the logged-in user's profile.

- **Headers:** `Authorization: Bearer <token>`
- **Responses:**
  - **`200 OK`** (Valid token):
    ```json
    { "username": "alice" }
    ```
  - **`401 Unauthorized`** (Header missing, malformed token, invalid signature, or expired token):
    ```json
    { "error": "Unauthorized" }
    ```

---

## 🧪 Testing with cURL

### 1. Register a user (Success)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

### 2. Register with invalid input (< 6 char password)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "123"}'
```

### 3. Register duplicate user
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

### 4. Login (Success)
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

### 5. Login with invalid password
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "wrongpassword"}'
```

### 6. Access Profile with Token
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

### 7. Access Profile without Token (Unauthorized)
```bash
curl -X GET http://localhost:3000/profile
```
