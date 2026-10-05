import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';

let mongoServer;
let adminToken;
let studentToken;
let studentUser;
let testEvent;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed initial Admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Faculty Admin',
      email: 'admin.test@campusconnect.edu',
      password: 'AdminPassword123',
      role: 'admin',
      department: 'Computer Science'
    });
  adminToken = adminRes.body.token;

  // Seed initial Student
  const studentRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Student Tester',
      email: 'student.test@campusconnect.edu',
      password: 'StudentPassword123',
      role: 'student',
      studentId: 'CU2026TEST',
      department: 'Computer Science',
      semester: 5
    });
  studentToken = studentRes.body.token;
  studentUser = studentRes.body.user;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('CampusConnect Backend Test Suite (5 Core Tests)', () => {
  // TEST 1: Authentication & Token Issuance
  test('1. Authentication: Student login with valid credentials returns JWT and user profile', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student.test@campusconnect.edu',
        password: 'StudentPassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('student.test@campusconnect.edu');
    expect(res.body.user.role).toBe('student');
  });

  // TEST 2: Role-Based Access Control (RBAC) Guard
  test('2. RBAC Guard: Student receives 403 Forbidden when attempting Admin-only event creation', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Student Workshop',
        description: 'Should be rejected by RBAC role middleware',
        category: 'Workshop',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '10:00 AM',
        venue: 'Room 101',
        maxSeats: 30
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden: Access denied/);
  });

  // TEST 3: Admin Event Creation with Seat Capacity
  test('3. Event Creation: Admin creates new event with seat capacity and retrieval works', async () => {
    const eventPayload = {
      title: 'AI & Cloud Infrastructure Bootcamp',
      description: 'Intensive workshop covering containers and microservices.',
      category: 'Workshop',
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      time: '02:00 PM - 05:00 PM',
      venue: 'Auditorium C',
      maxSeats: 25,
      organizer: 'CSE Tech Committee'
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(eventPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.event.title).toBe(eventPayload.title);
    expect(res.body.event.maxSeats).toBe(25);
    expect(res.body.event.registeredCount).toBe(0);

    testEvent = res.body.event;
  });

  // TEST 4: Student Event Registration & Seat Availability Decrement
  test('4. Registration: Student registers for event and available seats decrease dynamically', async () => {
    const res = await request(app)
      .post(`/api/events/${testEvent._id}/register`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.seatsRemaining).toBe(24);

    // Verify registration record exists in DB
    const reg = await Registration.findOne({ event: testEvent._id, student: studentUser.id });
    expect(reg).not.toBeNull();
    expect(reg.status).toBe('confirmed');

    // Verify event registeredCount updated
    const updatedEvent = await Event.findById(testEvent._id);
    expect(updatedEvent.registeredCount).toBe(1);
  });

  // TEST 5: Duplicate Registration Prevention & Cancellation
  test('5. Duplicate Prevention & Cancellation: Duplicate registration returns 400 and unregister restores seat', async () => {
    // Attempt duplicate registration
    const duplicateRes = await request(app)
      .post(`/api/events/${testEvent._id}/register`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toMatch(/already registered/i);

    // Unregister
    const unregisterRes = await request(app)
      .post(`/api/events/${testEvent._id}/unregister`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(unregisterRes.status).toBe(200);
    expect(unregisterRes.body.success).toBe(true);
    expect(unregisterRes.body.seatsRemaining).toBe(25);

    // Verify event registeredCount restored
    const restoredEvent = await Event.findById(testEvent._id);
    expect(restoredEvent.registeredCount).toBe(0);
  });
});
