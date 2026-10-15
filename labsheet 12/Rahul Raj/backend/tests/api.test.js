/**
 * Comprehensive API Test Suite
 * BTCS303T Full Stack | Coding Assessment - Problem 1
 * 
 * Tests all required endpoints, hard requirements, and hidden test criteria:
 * 1. Status codes (200, 201, 204, 400, 401, 403, 404, 409, 429)
 * 2. Login rate limiting with Retry-After header & 1-minute window reset
 * 3. Token handling (missing, malformed, expired) without crashing
 * 4. Ownership isolation (User A vs User B) & Admin override
 * 5. Pagination totals and status filtering
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_btcs303t_assessment';

const app = require('../src/app');
const store = require('../src/store');
const { JWT_SECRET } = require('../src/middleware/auth');

test.beforeEach(() => {
  store.reset();
});

test.describe('Problem 1: Secure Task Manager API Test Suite', () => {

  // --------------------------------------------------------------------------
  // 1. Authentication & Registration Tests
  // --------------------------------------------------------------------------
  test.describe('POST /auth/register', () => {
    test('should register a new user with 201 Created and default role "user"', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'student@example.com',
          password: 'Password123!'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.email, 'student@example.com');
      assert.equal(res.body.user.role, 'user');
      assert.ok(res.body.user.id);
      // Password must not be exposed
      assert.equal(res.body.user.password, undefined);
    });

    test('should register an admin user when role is "admin"', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'AdminPassword123!',
          role: 'admin'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, 'admin');
    });

    test('should return 400 for invalid inputs (missing email or password or invalid role)', async () => {
      // Missing password
      const res1 = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' });
      assert.equal(res1.status, 400);

      // Invalid email
      const res2 = await request(app)
        .post('/auth/register')
        .send({ email: 'notanemail', password: 'secretpassword' });
      assert.equal(res2.status, 400);

      // Invalid role
      const res3 = await request(app)
        .post('/auth/register')
        .send({ email: 'valid@example.com', password: 'secretpassword', role: 'superhero' });
      assert.equal(res3.status, 400);
    });

    test('should return 409 Conflict if email already exists', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send({ email: 'duplicate@example.com', password: 'pass' });

      // Duplicate registration with same email (case insensitive)
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'DUPLICATE@example.com', password: 'otherpass' });

      assert.equal(res.status, 409);
      assert.match(res.body.error, /Email already exists/i);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Login & Rate Limiting Tests
  // --------------------------------------------------------------------------
  test.describe('POST /auth/login and Rate Limiting', () => {
    test.beforeEach(async () => {
      // Register test user
      await request(app)
        .post('/auth/register')
        .send({ email: 'rahul@example.com', password: 'CorrectPassword123' });
    });

    test('should return 200 with 15-minute token on valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'rahul@example.com', password: 'CorrectPassword123' });

      assert.equal(res.status, 200);
      assert.ok(res.body.token);

      // Verify token expiration is 15 minutes (approx 900 seconds)
      const decoded = jwt.verify(res.body.token, JWT_SECRET);
      assert.equal(decoded.email, 'rahul@example.com');
      const lifespan = decoded.exp - decoded.iat;
      assert.equal(lifespan, 15 * 60);
    });

    test('should return 401 for wrong password or unregistered email', async () => {
      const res1 = await request(app)
        .post('/auth/login')
        .send({ email: 'rahul@example.com', password: 'WrongPassword' });
      assert.equal(res1.status, 401);

      const res2 = await request(app)
        .post('/auth/login')
        .send({ email: 'unknown@example.com', password: 'AnyPassword' });
      assert.equal(res2.status, 401);
    });

    test('Hard Requirement: return 429 with Retry-After after 5 failed attempts per minute, even with correct password', async () => {
      const testEmail = 'rahul@example.com';

      // 5 consecutive failed attempts
      for (let i = 1; i <= 5; i++) {
        const res = await request(app)
          .post('/auth/login')
          .send({ email: testEmail, password: 'WrongPassword' });
        assert.equal(res.status, 401, `Attempt ${i} should be 401`);
      }

      // 6th attempt with WRONG password -> 429 Rate limited with Retry-After header
      const resBlockedWrong = await request(app)
        .post('/auth/login')
        .send({ email: testEmail, password: 'WrongPassword' });
      assert.equal(resBlockedWrong.status, 429);
      assert.ok(resBlockedWrong.headers['retry-after']);
      assert.ok(Number(resBlockedWrong.headers['retry-after']) > 0);

      // 7th attempt with CORRECT password -> MUST STILL return 429
      const resBlockedCorrect = await request(app)
        .post('/auth/login')
        .send({ email: testEmail, password: 'CorrectPassword123' });
      assert.equal(resBlockedCorrect.status, 429);
      assert.ok(resBlockedCorrect.headers['retry-after']);
    });

    test('Hard Requirement: Rate limit counter resets after the one-minute window', async () => {
      const testEmail = 'rahul@example.com';

      // Record 5 failed attempts 61 seconds ago
      const sixtyOneSecondsAgo = Date.now() - 61000;
      for (let i = 0; i < 5; i++) {
        store.recordFailedAttempt(testEmail, sixtyOneSecondsAgo);
      }

      // Now attempt login with correct password -> window has expired, should succeed (200)
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testEmail, password: 'CorrectPassword123' });

      assert.equal(res.status, 200);
      assert.ok(res.body.token);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Token Handling & Middleware Tests
  // --------------------------------------------------------------------------
  test.describe('Token Handling Hard Requirements', () => {
    test('should return 401 if token is missing', async () => {
      const res = await request(app).get('/tasks');
      assert.equal(res.status, 401);
    });

    test('should return 401 if token is malformed and NEVER crash the server', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer totally.malformed.and.invalid.token.string');

      assert.equal(res.status, 401);
      assert.match(res.body.error, /invalid, malformed, or expired/i);
    });

    test('should return 401 if token is expired', async () => {
      // Create an expired token (expired 10 seconds ago)
      const expiredToken = jwt.sign(
        { id: 999, email: 'expired@test.com', role: 'user' },
        JWT_SECRET,
        { expiresIn: '-10s' }
      );

      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${expiredToken}`);

      assert.equal(res.status, 401);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Tasks CRUD, Isolation & Admin Permissions
  // --------------------------------------------------------------------------
  test.describe('Tasks CRUD and Hard Requirement Isolation', () => {
    let tokenUserA;
    let tokenUserB;
    let tokenAdmin;
    let userAId;
    let userBId;
    let taskA1Id;

    test.beforeEach(async () => {
      // Register User A
      const resA = await request(app).post('/auth/register').send({ email: 'userA@test.com', password: 'passwordA' });
      userAId = resA.body.user.id;
      const loginA = await request(app).post('/auth/login').send({ email: 'userA@test.com', password: 'passwordA' });
      tokenUserA = loginA.body.token;

      // Register User B
      const resB = await request(app).post('/auth/register').send({ email: 'userB@test.com', password: 'passwordB' });
      userBId = resB.body.user.id;
      const loginB = await request(app).post('/auth/login').send({ email: 'userB@test.com', password: 'passwordB' });
      tokenUserB = loginB.body.token;

      // Register Admin
      await request(app).post('/auth/register').send({ email: 'admin@test.com', password: 'passwordAdmin', role: 'admin' });
      const loginAdmin = await request(app).post('/auth/login').send({ email: 'admin@test.com', password: 'passwordAdmin' });
      tokenAdmin = loginAdmin.body.token;

      // Create Task for User A
      const resTask = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Task 1 User A', status: 'todo' });
      taskA1Id = resTask.body.id;
    });

    test('POST /tasks: should return 201 for valid task and 400 for invalid input', async () => {
      // Valid
      const resValid = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Second Task', status: 'doing' });
      assert.equal(resValid.status, 201);
      assert.equal(resValid.body.title, 'Second Task');
      assert.equal(resValid.body.status, 'doing');

      // Invalid status
      const resInvalidStatus = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'Bad Status', status: 'invalid_status' });
      assert.equal(resInvalidStatus.status, 400);

      // Missing title
      const resNoTitle = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: 'done' });
      assert.equal(resNoTitle.status, 400);
    });

    test('GET /tasks: Hard Requirement Isolation - User B must never see User A tasks', async () => {
      // User A sees their task
      const resA = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`);
      assert.equal(resA.status, 200);
      assert.equal(resA.body.total, 1);
      assert.equal(resA.body.data[0].id, taskA1Id);

      // User B sees 0 tasks
      const resB = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${tokenUserB}`);
      assert.equal(resB.status, 200);
      assert.equal(resB.body.total, 0);
      assert.equal(resB.body.data.length, 0);
    });

    test('GET /tasks: Pagination totals and status filter', async () => {
      // Create additional tasks for User A
      await request(app).post('/tasks').set('Authorization', `Bearer ${tokenUserA}`).send({ title: 'Task A2', status: 'todo' });
      await request(app).post('/tasks').set('Authorization', `Bearer ${tokenUserA}`).send({ title: 'Task A3', status: 'doing' });
      await request(app).post('/tasks').set('Authorization', `Bearer ${tokenUserA}`).send({ title: 'Task A4', status: 'done' });
      await request(app).post('/tasks').set('Authorization', `Bearer ${tokenUserA}`).send({ title: 'Task A5', status: 'todo' });

      // Total for User A is 5
      const resAll = await request(app)
        .get('/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${tokenUserA}`);
      assert.equal(resAll.status, 200);
      assert.equal(resAll.body.total, 5);
      assert.equal(resAll.body.data.length, 2);
      assert.equal(resAll.body.page, 1);

      // Filter by status=todo (Total 3 todo tasks)
      const resFilter = await request(app)
        .get('/tasks?status=todo')
        .set('Authorization', `Bearer ${tokenUserA}`);
      assert.equal(resFilter.status, 200);
      assert.equal(resFilter.body.total, 3);
      assert.ok(resFilter.body.data.every(t => t.status === 'todo'));
    });

    test('PATCH /tasks/:id: Ownership check, 403 for other user, 200 for owner and admin', async () => {
      // User B tries to update User A's task -> 403 Forbidden
      const resForbidden = await request(app)
        .patch(`/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ status: 'done' });
      assert.equal(resForbidden.status, 403);

      // User A (Owner) updates task -> 200 OK
      const resOwnerUpdate = await request(app)
        .patch(`/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: 'doing', title: 'Updated Title by Owner' });
      assert.equal(resOwnerUpdate.status, 200);
      assert.equal(resOwnerUpdate.body.status, 'doing');
      assert.equal(resOwnerUpdate.body.title, 'Updated Title by Owner');

      // Admin updates User A's task -> 200 OK (Admin override)
      const resAdminUpdate = await request(app)
        .patch(`/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ status: 'done' });
      assert.equal(resAdminUpdate.status, 200);
      assert.equal(resAdminUpdate.body.status, 'done');

      // Non-existent task -> 404
      const resNotFound = await request(app)
        .patch('/tasks/9999')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: 'New' });
      assert.equal(resNotFound.status, 404);

      // Invalid input (empty body) -> 400
      const resEmpty = await request(app)
        .patch(`/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({});
      assert.equal(resEmpty.status, 400);
    });

    test('DELETE /tasks/:id: Ownership check, 403 for other user, 204 for owner and admin', async () => {
      // User B tries to delete User A's task -> 403 Forbidden
      const resForbidden = await request(app)
        .delete(`/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${tokenUserB}`);
      assert.equal(resForbidden.status, 403);

      // Admin can delete User A's task -> 204 No Content
      const resAdminDelete = await request(app)
        .delete(`/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      assert.equal(resAdminDelete.status, 204);

      // Verify task is now deleted (404)
      const resCheckDeleted = await request(app)
        .delete(`/tasks/${taskA1Id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      assert.equal(resCheckDeleted.status, 404);
    });
  });
});
