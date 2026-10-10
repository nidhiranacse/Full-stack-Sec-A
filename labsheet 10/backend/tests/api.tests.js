const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');

describe('CampusConnect Lab Test Suite', () => {
  let adminToken, studentToken;

  beforeAll(async () => {
    // Register Admin
    const resAdmin = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN'
    });
    adminToken = resAdmin.body.accessToken;

    // Register Student
    const resStudent = await request(app).post('/api/auth/register').send({
      name: 'Student User',
      email: 'student@test.com',
      password: 'password123',
      role: 'STUDENT'
    });
    studentToken = resStudent.body.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it('1. Registration succeeds', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Setup',
      email: 'unique@test.com',
      password: 'password123'
    });
    expect(res.statusCode).toBe(201);
  });

  it('2. Login fails on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
  });

  it('3. Protected route rejects without token', async () => {
    const res = await request(app).get('/api/announcements');
    expect(res.statusCode).toBe(401);
  });

  it('4. Admin-only route rejects Student with 403', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hackathon', description: 'Coding', date: new Date(), location: 'Lab' });
    expect(res.statusCode).toBe(403);
  });

  it('5. Event creation succeeds for Admin', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Sports Meet', description: 'Annual Athletics', date: new Date(), location: 'Ground' });
    expect(res.statusCode).toBe(201);
  });
});