# Practical B1: JWT Authentication API

A simple Node.js + Express API implementing registration, login, and a JWT-protected profile route.

## Requirements

- Node.js 18 or newer
- npm

## Setup

1. Extract the ZIP and open a terminal in the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and set a private JWT secret. For example:

   ```env
   PORT=3000
   JWT_SECRET=use_a_long_random_secret_here
   JWT_EXPIRES_IN=1h
   ```

4. Start the server:

   ```bash
   npm start
   ```

   Development mode with automatic restarts:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:3000`.

## Endpoints

### 1. Register

`POST /register`

JSON body:

```json
{
  "username": "alice",
  "password": "secret123"
}
```

Success (`201`):

```json
{ "message": "User registered" }
```

Invalid username or password shorter than 6 characters (`400`):

```json
{ "error": "Invalid input" }
```

Duplicate username (`409`):

```json
{ "error": "Username already exists" }
```

### 2. Login

`POST /login`

JSON body:

```json
{
  "username": "alice",
  "password": "secret123"
}
```

Success (`200`):

```json
{ "token": "<jwt>" }
```

Unknown username or incorrect password (`401`):

```json
{ "error": "Invalid credentials" }
```

The JWT contains the `username` claim and expires in one hour.

### 3. Protected profile

`GET /profile`

Header:

```text
Authorization: Bearer <jwt>
```

Success (`200`):

```json
{ "username": "alice" }
```

Missing, malformed, invalid-signature, or expired token (`401`):

```json
{ "error": "Unauthorized" }
```

## Quick test with curl

Register:

```bash
curl -i -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
```

Login (copy the returned token):

```bash
curl -i -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
```

Access profile (replace `<jwt>` with the token from login):

```bash
curl -i http://localhost:3000/profile \
  -H "Authorization: Bearer <jwt>"
```

## Run tests

```bash
npm test
```

## Notes

- Passwords are hashed with `bcryptjs`; plaintext passwords are not stored.
- User data is held in an in-memory `Map` for this practical, so registered users disappear when the server restarts.
- Do not use the example JWT secret in production. Configure a strong secret via environment variables.
