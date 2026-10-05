import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Event } from '../src/models/Event.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Event.deleteMany({});
});

describe('CampusConnect Backend API Tests (Lab Sheet 10 - Task 6)', () => {
  // Test 1: User Registration
  test('1. Should register a new user successfully and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Student',
        email: 'alice@campus.edu',
        password: 'Password123!',
        role: 'STUDENT'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toMatchObject({
      name: 'Alice Student',
      email: 'alice@campus.edu',
      role: 'STUDENT'
    });
    // Check password is not returned in plain text
    expect(res.body.user.passwordHash).toBeUndefined();

    // Verify stored in DB with hashed password
    const userInDb = await User.findOne({ email: 'alice@campus.edu' });
    expect(userInDb).not.toBeNull();
    expect(userInDb.passwordHash).not.toBe('Password123!');
  });

  // Test 2: Login failure on wrong password
  test('2. Should reject login with 401 when password is incorrect', async () => {
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Admin',
        email: 'bob@campus.edu',
        password: 'CorrectPassword123!',
        role: 'ADMIN'
      });

    // Attempt login with wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bob@campus.edu',
        password: 'WrongPassword456!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  // Test 3: Protected route rejection without token
  test('3. Should reject access to protected route with 401 when no token is provided', async () => {
    const res = await request(app).get('/api/events');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Authentication required/i);
  });

  // Test 4: Admin-only route rejection for Student role (RBAC)
  test('4. Should reject Student from Admin-only event creation route with 403 Forbidden', async () => {
    // Register as STUDENT
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Charlie Student',
        email: 'charlie@campus.edu',
        password: 'Password123!',
        role: 'STUDENT'
      });

    const studentToken = regRes.body.accessToken;

    // Student attempts to POST to /api/events (Admin-only)
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Hackathon',
        description: 'Trying to create an event without admin permissions',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Auditorium 1',
        category: 'WORKSHOP',
        capacity: 50
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden: Access denied/i);
  });

  // Test 5: Event creation success for Admin
  test('5. Should allow Admin to create an event successfully (201 Created)', async () => {
    // Register as ADMIN
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dean Admin',
        email: 'dean@campus.edu',
        password: 'Password123!',
        role: 'ADMIN'
      });

    const adminToken = regRes.body.accessToken;

    const eventPayload = {
      title: 'Annual Tech Symposium 2026',
      description: 'Keynotes, tech workshops, hackathon, and prize distribution.',
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: 'Grand Hall & Online Stream',
      category: 'ACADEMIC',
      capacity: 250
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(eventPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      title: 'Annual Tech Symposium 2026',
      category: 'ACADEMIC',
      capacity: 250
    });

    // Check event exists in DB
    const eventInDb = await Event.findById(res.body.data._id);
    expect(eventInDb).not.toBeNull();
    expect(eventInDb.title).toBe('Annual Tech Symposium 2026');
  });
});
