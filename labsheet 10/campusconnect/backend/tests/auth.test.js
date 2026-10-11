const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/campusconnect_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('CampusConnect Auth & RBAC Tests', () => {
  let studentToken, adminToken;

  it('1. Should register a student successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'STUDENT'
    });
    expect(res.statusCode).toEqual(201);
  });

  it('2. Should reject login on incorrect password', async () => {
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
      .send({ title: 'Invalid Event', description: 'Test', date: new Date() });
    expect(res.statusCode).toEqual(403);
  });
});
