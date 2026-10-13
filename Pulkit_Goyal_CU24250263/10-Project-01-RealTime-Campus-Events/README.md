# Project 1: Real-Time Campus Event & Announcement Portal

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Project Overview & Architecture
An enterprise real-time event and broadcast notification system for academic campuses. Built using the **MERN Stack** (MongoDB, Express, React, Node.js) paired with **Socket.io** WebSockets and **Redis In-Memory Caching**.

### Core Technical Pillars:
1. **Real-Time Broadcast (WebSockets):** Instant notification dispatch via `Socket.io` whenever an administrator publishes a new campus announcement or emergency alert.
2. **High-Performance Caching (Redis):** Cache-aside pattern caching event queries to reduce primary database load and achieve sub-10ms response times.
3. **Role-Based Access Control (RBAC):** Admin users have write permissions (create events, broadcast announcements); student users can register, RSVP, and stream real-time updates.
4. **Security & Resilience:** JWT Bearer authentication, Express rate limiting, and request validation.
5. **Containerization:** Complete multi-service `docker-compose.yml` orchestrating Backend, Frontend, MongoDB, and Redis containers.

---

## 2. System Architecture Diagram
```
[ React SPA Client (Port 5173 / Redux Toolkit) ]
           │                         ▲
           │ HTTP REST               │ WebSockets (Socket.io)
           ▼                         │
   [ Express.js API Gateway (Port 5000) ]
     ├── Rate Limiter & JWT Auth
     ├── Redis Cache-Aside Layer <──> [ Redis Server (Port 6379) ]
     └── Mongoose ODM <──────────────> [ MongoDB Server (Port 27017) ]
```

---

## 3. How to Run Locally

### Option A: Using Docker Compose (Recommended)
```bash
cd 10-Project-01-RealTime-Campus-Events
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Redis: `localhost:6379`
- MongoDB: `localhost:27017`

### Option B: Running Locally with Node.js
```bash
# 1. Start Backend
cd backend
npm install
npm run seed  # Seeds initial admin & student accounts
npm start

# 2. Start Frontend
cd ../frontend
npm install
npm run dev
```

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: Why use WebSockets instead of HTTP Long Polling for campus announcements?
- HTTP polling requires clients to repeatedly send HTTP requests (every 3-5 seconds) to check for updates, creating massive server overhead and network traffic.
- WebSockets maintain a persistent, bidirectional, full-duplex TCP connection. When an announcement is made, the server instantly pushes the payload to all connected clients with zero latency and minimal overhead.

### Q2: How does the Redis Cache-Aside strategy function in this project?
- When `GET /api/events` is called:
  1. The server checks Redis: `redisClient.get('events:all')`.
  2. If found (Cache Hit), the cached JSON is returned immediately (response time ~5ms).
  3. If not found (Cache Miss), the database is queried via Mongoose, the result is saved to Redis with an expiration TTL (`redisClient.setEx('events:all', 300, data)`), and returned to the client.
  4. On event creation/update, `redisClient.del('events:all')` invalidates stale cache.
