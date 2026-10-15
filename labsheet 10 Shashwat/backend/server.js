require('dotenv').config();
const express = require('express');
const http    = require('http');
const cors    = require('cors');
const helmet  = require('helmet');
const { Server } = require('socket.io');

const { initDb }    = require('./src/config/db');
const { initSocket }= require('./src/services/socketService');
const { globalLimiter } = require('./src/middleware/rateLimiter');

const authRoutes         = require('./src/routes/auth');
const eventRoutes        = require('./src/routes/events');
const announcementRoutes = require('./src/routes/announcements');

const app    = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});

// ── Global Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(globalLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/announcements', announcementRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Bootstrap: init DB (seeds demo users) then start server ───────────────
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await initDb();       // creates DB + seeds demo accounts
  initSocket(io);       // attach Socket.io handlers

  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () =>
      console.log(`🚀 CampusConnect backend running on http://localhost:${PORT}`)
    );
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

module.exports = { app, server, bootstrap };
