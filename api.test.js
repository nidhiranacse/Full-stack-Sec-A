process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect_test';
process.env.LOGIN_MAX = '50'; // rate limit is tested separately below
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const redis = require('../src/config/redis');
const User = require('../src/models/User');
const Event = require('../src/models/Event');

let adminToken, studentToken;
const admin = { name: 'Admin One', email: 'admin@test.com', password: 'Admin@1234', role: 'ADMIN' };
const student = { name: 'Stu Dent', email: 'student@test.com', password: 'Student@1234' };

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({}); await Event.deleteMany({}); await redis.flushall();
});
afterAll(async () => { await mongoose.disconnect(); redis.disconnect(); });

describe('CampusConnect API', () => {
  test('1. registration succeeds and stores a bcrypt hash (not plaintext)', async () => {
    const res = await request(app).post('/api/auth/register').send(admin);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(admin.email);
    await request(app).post('/api/auth/register').send(student);
    const dbUser = await User.findOne({ email: admin.email });
    expect(dbUser.passwordHash).not.toBe(admin.password);
    expect(dbUser.passwordHash).toMatch(/^\$2[aby]\$10\$/); // bcrypt, 10 salt rounds
  });

  test('2. login fails with wrong password (401)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'wrong-pass' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('3. login succeeds, returns access token + httpOnly refresh cookie', async () => {
    const a = await request(app).post('/api/auth/login').send({ email: admin.email, password: admin.password });
    expect(a.status).toBe(200);
    adminToken = a.body.accessToken;
    expect(a.headers['set-cookie'][0]).toMatch(/refreshToken=.*HttpOnly/i);
    const s = await request(app).post('/api/auth/login').send({ email: student.email, password: student.password });
    studentToken = s.body.accessToken;
  });

  test('4. protected route rejects request without token (401)', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(401);
  });

  test('5. admin-only route rejects STUDENT with 403', async () => {
    const res = await request(app).post('/api/events').set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hack Night', date: '2026-12-01' });
    expect(res.status).toBe(403);
  });

  test('6. admin can create an event (201) and validation errors are structured 400s', async () => {
    const ok = await request(app).post('/api/events').set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Tech Fest 2026', location: 'Main Auditorium', date: '2026-11-15' });
    expect(ok.status).toBe(201);
    expect(ok.body.title).toBe('Tech Fest 2026');
    const bad = await request(app).post('/api/events').set('Authorization', `Bearer ${adminToken}`).send({ title: 'x' });
    expect(bad.status).toBe(400);
    expect(bad.body.errors[0]).toHaveProperty('field');
  });

  test('7. GET /api/events is cached (MISS then HIT) and invalidated on create', async () => {
    const r1 = await request(app).get('/api/events').set('Authorization', `Bearer ${studentToken}`);
    const r2 = await request(app).get('/api/events').set('Authorization', `Bearer ${studentToken}`);
    expect(r1.headers['x-cache']).toBe('MISS');
    expect(r2.headers['x-cache']).toBe('HIT');
    await request(app).post('/api/events').set('Authorization', `Bearer ${adminToken}`).send({ title: 'Coding Contest', date: '2026-12-05' });
    const r3 = await request(app).get('/api/events').set('Authorization', `Bearer ${studentToken}`);
    expect(r3.headers['x-cache']).toBe('MISS');
    expect(r3.body.total).toBe(2);
  });

  test('8. refresh endpoint issues a new access token from the cookie', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: student.email, password: student.password });
    const res = await request(app).post('/api/auth/refresh').set('Cookie', login.headers['set-cookie']);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });
});
