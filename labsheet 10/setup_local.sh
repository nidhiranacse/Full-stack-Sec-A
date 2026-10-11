#!/usr/bin/env bash
set -e

echo "íº€ Generating CampusConnect Application Layout (Local Setup)..."

mkdir -p backend/src/{config,controllers,middleware,models,routes,sockets,utils}
mkdir -p backend/tests
mkdir -p frontend/src/{api,components,pages,store}
mkdir -p frontend/public

# ----------------- BACKEND FILES -----------------

cat << 'INNER_EOF' > backend/package.json
{
  "name": "campusconnect-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "npx nodemon server.js",
    "test": "jest --runInBand --detectOpenHandles"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.2.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.1",
    "redis": "^4.6.13",
    "socket.io": "^4.7.5",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0",
    "supertest": "^6.3.4"
  }
}
INNER_EOF

cat << 'INNER_EOF' > backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
INNER_EOF

cat << 'INNER_EOF' > backend/src/config/redis.js
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('Redis Connected'));

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();

module.exports = redisClient;
INNER_EOF

cat << 'INNER_EOF' > backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'STUDENT'], default: 'STUDENT' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
INNER_EOF

cat << 'INNER_EOF' > backend/src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  rsvps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
INNER_EOF

cat << 'INNER_EOF' > backend/src/models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
INNER_EOF

cat << 'INNER_EOF' > backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing or malformed' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
INNER_EOF

cat << 'INNER_EOF' > backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
INNER_EOF

cat << 'INNER_EOF' > backend/src/utils/validators.js
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'STUDENT']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ errors: err.errors });
  }
};

module.exports = { validate, registerSchema, loginSchema };
INNER_EOF

cat << 'INNER_EOF' > backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET || 'refresh_secret_key',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, passwordHash: password, role });
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh Token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refresh_secret_key');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token subject' });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired Refresh Token' });
  }
};

module.exports = { register, login, refresh };
INNER_EOF

cat << 'INNER_EOF' > backend/src/controllers/eventController.js
const Event = require('../models/Event');
const redisClient = require('../config/redis');

const getEvents = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const cacheKey = `events:page:${page}:search:${search}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({ source: 'cache', ...JSON.parse(cachedData) });
    }

    const query = { title: { $regex: search, $options: 'i' } };
    const events = await Event.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Event.countDocuments(query);
    const result = { events, total, totalPages: Math.ceil(total / limit), currentPage: Number(page) };

    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
    res.json({ source: 'database', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const event = await Event.create({ title, description, date });

    const keys = await redisClient.keys('events:*');
    if (keys.length > 0) await redisClient.del(keys);

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.rsvps.includes(req.user.id)) {
      event.rsvps.push(req.user.id);
      await event.save();
      const keys = await redisClient.keys('events:*');
      if (keys.length > 0) await redisClient.del(keys);
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEvents, createEvent, rsvpEvent };
INNER_EOF

cat << 'INNER_EOF' > backend/src/sockets/socketHandler.js
const jwt = require('jsonwebtoken');

const initSockets = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: Token missing'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid Token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`âš¡ WebSocket connected: User ${socket.user.id} (${socket.user.role})`);
    
    socket.on('disconnect', () => {
      console.log(`í´¥ WebSocket disconnected: User ${socket.user.id}`);
    });
  });
};

module.exports = initSockets;
INNER_EOF

cat << 'INNER_EOF' > backend/src/routes/authRoutes.js
const express = require('express');
const { register, login, refresh } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validate, registerSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);

module.exports = router;
INNER_EOF

cat << 'INNER_EOF' > backend/src/routes/eventRoutes.js
const express = require('express');
const { getEvents, createEvent, rsvpEvent } = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getEvents);
router.post('/', authorize('ADMIN'), createEvent);
router.post('/:id/rsvp', authorize('STUDENT'), rsvpEvent);

module.exports = router;
INNER_EOF

cat << 'INNER_EOF' > backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const Announcement = require('./models/Announcement');
const { authenticate, authorize } = require('./middleware/authMiddleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.post('/api/announcements', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, message } = req.body;
    const announcement = await Announcement.create({ title, message, createdBy: req.user.id });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new-announcement', announcement);
    }
    
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = app;
INNER_EOF

cat << 'INNER_EOF' > backend/server.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSockets = require('./src/sockets/socketHandler');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', credentials: true }
});

initSockets(io);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
INNER_EOF

cat << 'INNER_EOF' > backend/tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/campusconnect_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('CampusConnect Auth & RBAC Tests', () => {
  let studentToken;

  it('1. Should register a student successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'STUDENT'
    });
    expect(res.statusCode).toEqual(201);
  });

  it('2. Should reject login on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'student@campus.edu',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toEqual(401);
  });

  it('3. Should login successfully and return access token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'student@campus.edu',
      password: 'password123'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
    studentToken = res.body.accessToken;
  });

  it('4. Should reject protected route when access token is missing', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toEqual(401);
  });

  it('5. Should reject Student from creating events (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Unauthorized Event', description: 'Test', date: new Date() });
    expect(res.statusCode).toEqual(403);
  });
});
INNER_EOF

# ----------------- FRONTEND FILES -----------------

cat << 'INNER_EOF' > frontend/package.json
{
  "name": "campusconnect-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.2.3",
    "axios": "^1.6.8",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^9.1.1",
    "react-router-dom": "^6.22.3",
    "socket.io-client": "^4.7.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.8"
  }
}
INNER_EOF

cat << 'INNER_EOF' > frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
});
INNER_EOF

cat << 'INNER_EOF' > frontend/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CampusConnect</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
INNER_EOF

cat << 'INNER_EOF' > frontend/src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: { auth: authReducer }
});
INNER_EOF

cat << 'INNER_EOF' > frontend/src/api/axiosInstance.js
import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/authSlice';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        store.dispatch(setCredentials({ user: store.getState().auth.user, accessToken: res.data.accessToken }));
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
INNER_EOF

cat << 'INNER_EOF' > frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { accessToken, user } = useSelector((state) => state.auth);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { setCredentials } from '../store/authSlice';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      dispatch(setCredentials(res.data));
      navigate('/dashboard');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: 'auto' }}>
      <h2>CampusConnect Login</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
        <button type="submit" style={{ width: '100%' }}>Log In</button>
      </form>
    </div>
  );
};
INNER_EOF

cat << 'INNER_EOF' > frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axiosInstance';
import { logout } from '../store/authSlice';

export const Dashboard = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    const socket = io('http://localhost:5000', {
      auth: { token: accessToken },
      reconnectionAttempts: 5
    });

    socket.on('new-announcement', (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [accessToken]);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get(`/events?search=${search}`);
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEvents(); }, [search]);

  const handleRSVP = async (id) => {
    await axiosInstance.post(`/events/${id}/rsvp`);
    fetchEvents();
  };

  return (
    <div style={{ padding: 30 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>CampusConnect Portal</h1>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </header>

      <h3>Welcome, {user?.name} ({user?.role})</h3>

      <div style={{ background: '#f0f0f0', padding: 15, borderRadius: 5, marginBottom: 20 }}>
        <h4>í³¢ Live Announcements <span style={{ background: 'red', color: 'white', padding: '2px 8px', borderRadius: '50%' }}>{unreadCount}</span></h4>
        <ul>
          {announcements.map((a, i) => (
            <li key={i}><strong>{a.title}:</strong> {a.message}</li>
          ))}
        </ul>
      </div>

      <hr />

      <h3>Events Directory</h3>
      <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 15, padding: 5 }} />

      <ul>
        {events?.map((ev) => (
          <li key={ev._id} style={{ marginBottom: 10 }}>
            <strong>{ev.title}</strong> - {new Date(ev.date).toLocaleDateString()}
            <p>{ev.description}</p>
            {user?.role === 'STUDENT' && (
              <button onClick={() => handleRSVP(ev._id)}>
                {ev.rsvps.includes(user.id) ? 'RSVPed âœ”' : 'RSVP'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
INNER_EOF

cat << 'INNER_EOF' > frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
INNER_EOF

cat << 'INNER_EOF' > frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
INNER_EOF

echo "âœ… Local structure setup script updated!"
