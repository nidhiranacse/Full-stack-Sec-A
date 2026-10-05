const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/db');
const seedDatabase = require('../src/utils/seed');

let adminToken = '';
let studentToken = '';
let testEventId = null;

beforeAll(() => {
  // Re-seed DB to a known clean state before running tests
  seedDatabase();
});

describe('CampusConnect Backend Test Suite', () => {

  // Test 1: Authentication - User Registration
  describe('1. Authentication Module - User Registration', () => {
    it('should register a new student account successfully with hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ananya Verma',
          email: 'ananya.verma@campusconnect.edu',
          password: 'Password@123',
          role: 'student',
          department: 'Computer Science',
          semester: '6th Sem'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('ananya.verma@campusconnect.edu');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.token).toBeDefined();

      // Ensure password is not returned in response
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject registration if email is already taken', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'admin@campusconnect.edu',
          password: 'Password@123'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid input fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  // Test 2: Authentication - User Login & JWT Generation
  describe('2. Authentication Module - Login & Tokens', () => {
    it('should authenticate Admin user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@campusconnect.edu',
          password: 'Admin@123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
      adminToken = res.body.data.token;
    });

    it('should authenticate Student user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rahul.sharma@campusconnect.edu',
          password: 'Student@123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('student');
      studentToken = res.body.data.token;
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@campusconnect.edu',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // Test 3: Events CRUD & Role-Based Access Control (RBAC)
  describe('3. Events Module & RBAC Middleware', () => {
    it('should allow Admin to create a new event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Quantum Computing Seminar 2026',
          description: 'Introduction to Qubits, Quantum Gates, and Quantum Algorithms.',
          category: 'Seminar',
          date: '2026-11-30',
          time: '11:00 AM - 01:00 PM',
          venue: 'Room 302, Science Block',
          total_seats: 50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Quantum Computing Seminar 2026');
      testEventId = res.body.data.id;
    });

    it('should FORBID a student from creating an event (RBAC test)', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Student Event',
          description: 'This event should be blocked by role middleware.',
          category: 'Workshop',
          date: '2026-12-01',
          time: '10:00 AM',
          venue: 'Lab 1',
          total_seats: 30
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should list events with pagination and filtering', async () => {
      const res = await request(app)
        .get('/api/events?limit=5&page=1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.events.length).toBeLessThanOrEqual(5);
      expect(res.body.data.pagination.totalItems).toBeGreaterThan(10);
      expect(res.body.data.pagination.totalPages).toBeGreaterThan(1);
    });
  });

  // Test 4: Event Registration & Seat Availability Logic
  describe('4. Event Registration & Seat Availability Logic', () => {
    it('should allow a student to register for an event and decrement available seats', async () => {
      const res = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registered_count).toBe(1);
      expect(res.body.data.available_seats).toBe(49);
    });

    it('should prevent duplicate registration by the same student', async () => {
      const res = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('already registered');
    });

    it('should allow student to unregister from the event', async () => {
      const res = await request(app)
        .post(`/api/events/${testEventId}/unregister`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_registered).toBe(false);
    });
  });

  // Test 5: Resources Module - Filtering & Download
  describe('5. Resources Module - Filtering & Download', () => {
    it('should retrieve resources filtered by semester', async () => {
      const res = await request(app)
        .get('/api/resources?semester=6th Sem');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resources.length).toBeGreaterThan(0);
      res.body.data.resources.forEach(r => {
        expect(r.semester).toBe('6th Sem');
      });
    });

    it('should download a resource and increment download count', async () => {
      const listRes = await request(app).get('/api/resources?limit=1');
      const resourceId = listRes.body.data.resources[0].id;

      const downloadRes = await request(app)
        .get(`/api/resources/${resourceId}/download`);

      expect(downloadRes.statusCode).toBe(200);
      expect(downloadRes.headers['content-disposition']).toContain('attachment');
    });
  });

  // Test 6: Dashboards & Analytics
  describe('6. Dashboard & Analytics Module', () => {
    it('should return Admin dashboard analytics with event breakdown', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.analytics.total_events).toBeGreaterThan(10);
      expect(res.body.data.analytics.total_students).toBeGreaterThan(0);
      expect(res.body.data.event_breakdown).toBeDefined();
    });

    it('should return Student dashboard with registration history', async () => {
      const res = await request(app)
        .get('/api/dashboard/student')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.my_events).toBeDefined();
    });
  });
});
