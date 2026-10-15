/**
 * CampusConnect — Comprehensive API Test Suite
 * Uses Jest + Supertest against a temporary JSON test database (LowDB).
 *
 * Run:  npm test
 */

const path = require('path');
const fs   = require('fs');

// ── IMPORTANT: set test DB path BEFORE requiring anything that uses getDb() ──
const TEST_DB = path.join(__dirname, '../../data/test_campusconnect.json');
process.env.NODE_ENV = 'test';
process.env.DB_PATH  = TEST_DB;

const request = require('supertest');
const { app, server, bootstrap } = require('../../server');
const { closeDb } = require('../../src/config/db');

// ── Test data ──────────────────────────────────────────────────────────────
const adminUser   = { name: 'Test Admin',   email: 'testadmin@campus.edu',   password: 'admin1234',  role: 'ADMIN' };
const studentUser = { name: 'Test Student', email: 'teststudent@campus.edu', password: 'student1234' };

let adminToken, studentToken, adminRefreshToken, eventId, announcementId;

// ── Bootstrap (init DB + socket) ───────────────────────────────────────────
beforeAll(async () => {
  await bootstrap();
});

// ── Teardown ───────────────────────────────────────────────────────────────
afterAll(() => {
  server.close();
  closeDb();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

// ══════════════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════════════
describe('🔐 Auth Routes', () => {
  test('POST /api/auth/register → 201 (admin)', async () => {
    const res = await request(app).post('/api/auth/register').send(adminUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.accessToken).toBeDefined();
    adminToken        = res.body.accessToken;
    adminRefreshToken = res.body.refreshToken;
  });

  test('POST /api/auth/register → 201 (student)', async () => {
    const res = await request(app).post('/api/auth/register').send(studentUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('STUDENT');
    studentToken = res.body.accessToken;
  });

  test('POST /api/auth/register → 409 duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(adminUser);
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/register → 400 validation error', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/login → 200 correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test('POST /api/auth/login → 401 wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/refresh → 200 with new tokens', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: adminRefreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    // Update token for subsequent tests
    adminToken        = res.body.accessToken;
    adminRefreshToken = res.body.refreshToken;
  });

  test('POST /api/auth/logout → 200', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: adminRefreshToken });
    expect(res.statusCode).toBe(200);

    // Re-login to restore admin token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = loginRes.body.accessToken;
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  EVENTS
// ══════════════════════════════════════════════════════════════════════════
describe('🗓️  Events Routes', () => {
  test('GET /api/events → 401 without token', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/events → 201 admin creates event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title:       'Tech Fest 2025',
        description: 'Annual technology festival',
        date:        '2025-11-20T10:00:00.000Z',
        location:    'Main Auditorium',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Tech Fest 2025');
    eventId = res.body.id;
  });

  test('POST /api/events → 403 student cannot create event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hack', date: '2025-11-20T10:00:00.000Z' });
    expect(res.statusCode).toBe(403);
  });

  test('GET /api/events → 200 with pagination', async () => {
    const res = await request(app)
      .get('/api/events?page=1&limit=6')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body).toHaveProperty('total');
  });

  test('GET /api/events → cached on second call', async () => {
    const res = await request(app)
      .get('/api/events?page=1&limit=6')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cached).toBe(true);
  });

  test('GET /api/events?search=Tech → returns matching events', async () => {
    const res = await request(app)
      .get('/api/events?search=Tech')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.events.length).toBeGreaterThan(0);
  });

  test('GET /api/events/:id → 200 single event', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Tech Fest 2025');
  });

  test('POST /api/events/:id/rsvp → 201 RSVP created', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.rsvped).toBe(true);
  });

  test('GET /api/events/my-rsvps → 200 returns RSVP\'d events', async () => {
    const res = await request(app)
      .get('/api/events/my-rsvps')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('POST /api/events/:id/rsvp → 200 RSVP cancelled (toggle)', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.rsvped).toBe(false);
  });

  test('PUT /api/events/:id → 200 admin updates event', async () => {
    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title:    'Tech Fest 2025 — Updated',
        date:     '2025-11-21T10:00:00.000Z',
        location: 'New Hall',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Tech Fest 2025 — Updated');
  });

  test('DELETE /api/events/:id → 200 admin deletes event', async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/events/:id → 404 after deletion', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  ANNOUNCEMENTS
// ══════════════════════════════════════════════════════════════════════════
describe('📢 Announcements Routes', () => {
  test('POST /api/announcements → 403 student cannot create', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Test', content: 'Hello' });
    expect(res.statusCode).toBe(403);
  });

  test('POST /api/announcements → 201 admin creates', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Exam Schedule Released', content: 'Final exams start Dec 1st.' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Exam Schedule Released');
    announcementId = res.body.id;
  });

  test('GET /api/announcements → 200 list', async () => {
    const res = await request(app)
      .get('/api/announcements')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('DELETE /api/announcements/:id → 200 admin deletes', async () => {
    const res = await request(app)
      .delete(`/api/announcements/${announcementId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════
describe('💚 Health Check', () => {
  test('GET /api/health → 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
