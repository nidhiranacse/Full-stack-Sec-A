// Integration tests (Supertest + in-memory SQLite) - Radha Pandey, CSE
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { sequelize, User } = require('../src/db');

let adminToken, s1, s2, eventId;
const auth = (t) => ({ Authorization: `Bearer ${t}` });
const future = new Date(Date.now() + 5 * 864e5).toISOString();

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await User.create({ name: 'Admin', email: 'admin@t.com', passwordHash: await bcrypt.hash('Admin@123', 10), role: 'admin' });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@t.com', password: 'Admin@123' })).body.token;
  s1 = (await request(app).post('/api/auth/signup').send({ name: 'Stu One', email: 's1@t.com', password: 'secret1' })).body.token;
  s2 = (await request(app).post('/api/auth/signup').send({ name: 'Stu Two', email: 's2@t.com', password: 'secret1' })).body.token;
});
afterAll(() => sequelize.close());

test('auth: duplicate signup 409, wrong password 401, missing token 401', async () => {
  expect((await request(app).post('/api/auth/signup').send({ name: 'Stu One', email: 's1@t.com', password: 'secret1' })).status).toBe(409);
  expect((await request(app).post('/api/auth/login').send({ email: 's1@t.com', password: 'wrongpw' })).status).toBe(401);
  expect((await request(app).get('/api/events')).status).toBe(401);
});

test('RBAC: student cannot create events; admin can; bad input gives 400', async () => {
  const body = { title: 'Hack Night', category: 'hackathon', date: future, venue: 'Lab 1', capacity: 1 };
  expect((await request(app).post('/api/events').set(auth(s1)).send(body)).status).toBe(403);
  expect((await request(app).post('/api/events').set(auth(adminToken)).send({ ...body, capacity: 0 })).status).toBe(400);
  const r = await request(app).post('/api/events').set(auth(adminToken)).send(body);
  expect(r.status).toBe(201);
  expect(r.body.seatsLeft).toBe(1);
  eventId = r.body.id;
});

test('registration: seat limit, duplicates, unregister, admin list', async () => {
  expect((await request(app).post(`/api/events/${eventId}/register`).set(auth(s1))).status).toBe(201);
  expect((await request(app).post(`/api/events/${eventId}/register`).set(auth(s1))).status).toBe(409); // duplicate
  const full = await request(app).post(`/api/events/${eventId}/register`).set(auth(s2));
  expect(full.status).toBe(409); // no seats left
  expect(full.body.error).toMatch(/full/i);

  const list = await request(app).get(`/api/events/${eventId}/registrations`).set(auth(adminToken));
  expect(list.body.total).toBe(1);

  expect((await request(app).delete(`/api/events/${eventId}/register`).set(auth(s1))).status).toBe(204);
  expect((await request(app).post(`/api/events/${eventId}/register`).set(auth(s2))).status).toBe(201);
});

test('search, filter and pagination', async () => {
  for (let i = 0; i < 12; i++) {
    await request(app).post('/api/events').set(auth(adminToken))
      .send({ title: `Workshop ${i}`, category: 'workshop', date: future, venue: 'Hall', capacity: 10 });
  }
  const p1 = await request(app).get('/api/events?category=workshop&limit=10&page=1').set(auth(s1));
  expect(p1.body.total).toBe(12);
  expect(p1.body.data.length).toBe(10);
  expect((await request(app).get('/api/events?category=workshop&page=2').set(auth(s1))).body.data.length).toBe(2);
  expect((await request(app).get('/api/events?q=hack').set(auth(s1))).body.total).toBe(1);
  expect((await request(app).get('/api/events?date=bad').set(auth(s1))).status).toBe(400);
});

test('resources: admin uploads PDF, exe rejected, student downloads, student cannot upload', async () => {
  const up = await request(app).post('/api/resources').set(auth(adminToken))
    .field('title', 'DBMS Notes').field('subject', 'DBMS').field('semester', '5')
    .attach('file', Buffer.from('%PDF-1.4 test'), { filename: 'notes.pdf', contentType: 'application/pdf' });
  expect(up.status).toBe(201);

  const bad = await request(app).post('/api/resources').set(auth(adminToken))
    .field('title', 'Bad file').field('subject', 'DBMS').field('semester', '5')
    .attach('file', Buffer.from('MZ'), { filename: 'virus.exe', contentType: 'application/octet-stream' });
  expect(bad.status).toBe(400);

  expect((await request(app).post('/api/resources').set(auth(s1)).field('title', 'x')).status).toBe(403);
  const dl = await request(app).get(`/api/resources/${up.body.id}/download`).set(auth(s1));
  expect(dl.status).toBe(200);
  expect((await request(app).get('/api/resources?subject=dbms&semester=5').set(auth(s1))).body.total).toBe(1);
});

test('dashboards', async () => {
  const a = await request(app).get('/api/dashboard/admin').set(auth(adminToken));
  expect(a.status).toBe(200);
  expect(a.body.totalEvents).toBe(13);
  expect(a.body.totalRegistrations).toBe(1);
  const s = await request(app).get('/api/dashboard/student').set(auth(s2));
  expect(s.body.upcoming.length).toBe(1);
  expect((await request(app).get('/api/dashboard/admin').set(auth(s2))).status).toBe(403);
});
