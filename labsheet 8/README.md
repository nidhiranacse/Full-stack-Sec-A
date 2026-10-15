# CampusConnect

Role-based college events and announcements for Northbridge University. The workspace contains a React/Vite client and an Express API backed by MongoDB and Redis, with Socket.io for student announcements.

## Run the stack

Docker Desktop must be running. From the project root:

```sh
docker compose up --build
```

Open the frontend at `http://localhost:8080`; the API health check is at `http://localhost:4000/api/health`. MongoDB and Redis are available only on the Compose network. MongoDB data persists in the `mongo-data` volume.

Compose has local-only development credentials so the stack starts in a fresh workspace. Before deployment, copy `.env.example` to `.env`, replace every placeholder with unique secrets, set `NODE_ENV=production`, set `FRONTEND_ORIGIN` to the one deployed frontend origin, and set `VITE_API_URL` and `VITE_SOCKET_URL` to the deployed API origins. Do not use the Compose defaults in production. Production mode rejects missing, short, or identical JWT secrets and configures the refresh cookie for HTTPS.

Create the initial administrator after configuring `ADMIN_NAME`, `ADMIN_EMAIL`, and an `ADMIN_PASSWORD` of at least 12 characters in `.env`:

```sh
docker compose exec api npm run seed:admin
```

Public registration always creates a `STUDENT`; it cannot assign administrator privileges. Add events and send live announcements by signing in with the seeded administrator account.

## Local development

Copy `.env.example` to `.env`. For a host-run API, start just the data services with `docker compose up mongo redis`, change `FRONTEND_ORIGIN` in `.env` to `http://localhost:5173`, then run `npm --prefix server install` and `npm --prefix server run dev`. The MongoDB and Redis ports are bound to localhost only. Run `npm install` and `npm run dev` for the client. For the full Docker deployment instead, keep the Compose frontend origin at `http://localhost:8080` and use `docker compose up --build`.

Run `npm install` and `npm run dev` for the client. The browser API defaults to `http://localhost:4000/api`. Access tokens exist only in memory; the refresh token is an httpOnly cookie.

## Verification

```sh
npm test
npm run build
npm --prefix server test
docker compose config --quiet
```

The React suite uses Vitest and React Testing Library. The API suite uses Jest and Supertest and mocks the data layer, so it does not need MongoDB or Redis running.

Once the Compose stack is healthy and the backend dependencies are installed locally, run the benchmark from the project root:

```sh
npm --prefix server run benchmark
```

It sends 100 uncached requests and 100 requests against a warmed cache, then prints both average response times and the measured latency reduction. Results depend on the host and should be recorded from the actual run, not copied from a sample. Redis event-list entries expire after 60 seconds and are invalidated on admin event create/update/delete and RSVP changes.

## API outline

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/events?page=1&limit=6&search=design&category=WORKSHOP`
- `POST /api/events`, `PUT /api/events/:eventId`, `DELETE /api/events/:eventId` (admin only)
- `POST /api/events/:eventId/rsvp` (authenticated student or admin)
- `GET /api/announcements`, `POST /api/announcements` (admin create; broadcasts `new-announcement` to connected students)

The login limiter allows five attempts per IP in 15 minutes. Request bodies are Zod-validated, CORS uses the configured origin allowlist, and Helmet sets security headers.