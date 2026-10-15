const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, clearUsers, JWT_SECRET } = require('../app');

describe('Practical B1: JWT Authentication API Tests', () => {
  beforeEach(() => {
    clearUsers();
  });

  describe('POST /register', () => {
    it('should register a new user successfully with 201', async () => {
      const res = await request(app)
        .post('/register')
        .send({ username: 'john_doe', password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'User registered' });
    });

    it('should return 400 if username is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({ password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid input' });
    });

    it('should return 400 if username is empty', async () => {
      const res = await request(app)
        .post('/register')
        .send({ username: '   ', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid input' });
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({ username: 'john_doe' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid input' });
    });

    it('should return 400 if password is shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/register')
        .send({ username: 'john_doe', password: '12345' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid input' });
    });

    it('should return 409 if username is already taken', async () => {
      await request(app)
        .post('/register')
        .send({ username: 'john_doe', password: 'password123' });

      const res = await request(app)
        .post('/register')
        .send({ username: 'john_doe', password: 'otherpassword' });

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ error: 'Username already exists' });
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/register')
        .send({ username: 'john_doe', password: 'password123' });
    });

    it('should return 200 with JWT token for valid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'john_doe', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');

      // Verify token structure and payload
      const decoded = jwt.verify(res.body.token, JWT_SECRET);
      expect(decoded.username).toBe('john_doe');
      // Verify expires in ~1 hour (3600 seconds)
      expect(decoded.exp - decoded.iat).toBe(3600);
    });

    it('should return 401 for unknown user', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'non_existent_user', password: 'password123' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/login')
        .send({ username: 'john_doe', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });
  });

  describe('GET /profile', () => {
    let validToken;

    beforeEach(async () => {
      await request(app)
        .post('/register')
        .send({ username: 'john_doe', password: 'password123' });

      const loginRes = await request(app)
        .post('/login')
        .send({ username: 'john_doe', password: 'password123' });

      validToken = loginRes.body.token;
    });

    it('should return 200 with username for a valid token', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ username: 'john_doe' });
    });

    it('should return 401 if Authorization header is missing', async () => {
      const res = await request(app).get('/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if Authorization header is malformed', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Authorization', 'InvalidHeaderFormat');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if token signature is invalid', async () => {
      const invalidSecretToken = jwt.sign(
        { username: 'john_doe' },
        'wrong_secret_key'
      );

      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${invalidSecretToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if token has expired', async () => {
      // Create an already-expired token
      const expiredToken = jwt.sign(
        { username: 'john_doe' },
        JWT_SECRET,
        { expiresIn: -10 }
      );

      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });
});
