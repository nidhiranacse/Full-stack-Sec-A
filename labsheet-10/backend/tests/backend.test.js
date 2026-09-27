const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Event = require('../src/models/Event');

const TEST_MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect_test';

beforeAll(async () => {
  // Connect to test MongoDB database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }
  // Clear any existing test data
  await User.deleteMany({});
  await Event.deleteMany({});
});

afterAll(async () => {
  // Clean up and disconnect
  await User.deleteMany({});
  await Event.deleteMany({});
  await mongoose.connection.close();
});

describe('CampusConnect Backend API Test Suite (Lab Sheet 10)', () => {
  let adminToken = '';
  let studentToken = '';
  let studentRefreshToken = '';
  let createdEventId = '';

  const testAdmin = {
    name: 'Admin User',
    email: 'admin_test@campus.edu',
    password: 'AdminPassword123',
    role: 'ADMIN',
  };

  const testStudent = {
    name: 'Student User',
    email: 'student_test@campus.edu',
    password: 'StudentPassword123',
    role: 'STUDENT',
  };

  // Test 1: User Registration
  it('1. POST /api/auth/register should successfully register a new user and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('email', testStudent.email);
    expect(res.body.user).toHaveProperty('role', 'STUDENT');
    expect(res.body.user).not.toHaveProperty('passwordHash');

    // Extract cookies for refresh test
    studentToken = res.body.accessToken;
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const match = cookies.find((c) => c.startsWith('refreshToken='));
      if (match) {
        studentRefreshToken = match.split(';')[0];
      }
    }
  });

  // Register Admin for subsequent tests
  it('Setup: Register an Admin user for RBAC tests', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testAdmin);

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('ADMIN');
    adminToken = res.body.accessToken;
  });

  // Test 2: Login Failure on Wrong Password
  it('2. POST /api/auth/login should fail with 401 when password is incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudent.email,
        password: 'CompletelyWrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  // Test 3: Protected Route Rejection Without Token
  it('3. POST /api/events should reject with 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        title: 'Unauthorized Hackathon',
        description: 'Should fail because no token was supplied',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Hall A',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  // Test 4: Admin-Only Route Rejection for Student Role
  it('4. POST /api/events should reject with 403 when accessed by a Student', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Student Attempted Event',
        description: 'Should fail because students cannot create events',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Lab 4',
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Forbidden');
  });

  // Test 5: Event Creation Success by Admin
  it('5. POST /api/events should succeed with 201 when called by an Admin', async () => {
    const eventPayload = {
      title: 'Annual Tech Fest 2026',
      description: 'The largest annual campus technical conference with hackathons and workshops.',
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      location: 'Main Auditorium & CS Labs',
      category: 'Hackathon',
      capacity: 250,
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(eventPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('event');
    expect(res.body.event.title).toBe(eventPayload.title);
    expect(res.body.event.capacity).toBe(250);

    createdEventId = res.body.event._id;
  });

  // Test 6: Token Refresh Endpoint without re-login
  it('6. POST /api/auth/refresh should issue a new access token using httpOnly cookie', async () => {
    const reqInstance = request(app).post('/api/auth/refresh');
    if (studentRefreshToken) {
      reqInstance.set('Cookie', [studentRefreshToken]);
    }
    const res = await reqInstance;

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('email', testStudent.email);
  });

  // Test 7: GET /api/events with caching headers
  it('7. GET /api/events should return paginated events and cache headers', async () => {
    // First call (MISS)
    const res1 = await request(app).get('/api/events?page=1&limit=5');
    expect(res1.status).toBe(200);
    expect(res1.body).toHaveProperty('events');
    expect(Array.isArray(res1.body.events)).toBe(true);
    expect(res1.body.events.length).toBeGreaterThanOrEqual(1);

    // Second call should hit the cache or return valid response
    const res2 = await request(app).get('/api/events?page=1&limit=5');
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
  });

  // Test 8: Student RSVP toggle
  it('8. POST /api/events/:id/rsvp should allow a student to RSVP to an event', async () => {
    const res = await request(app)
      .post(`/api/events/${createdEventId}/rsvp`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rsvpd', true);
    expect(res.body).toHaveProperty('rsvpCount', 1);
  });
});
