process.env.LOGIN_MAX = '5';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect_test';
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const redis = require('../src/config/redis');
beforeAll(() => mongoose.connect(process.env.MONGO_URI));
afterAll(async () => { await mongoose.disconnect(); redis.disconnect(); });

test('9. login is rate limited: 6th attempt within 15 min returns 429', async () => {
  let last;
  for (let i = 0; i < 6; i++) last = await request(app).post('/api/auth/login').send({ email: 'nobody@x.com', password: 'bad' });
  expect(last.status).toBe(429);
});
