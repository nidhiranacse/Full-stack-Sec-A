const request = require('supertest');
const app = require('../app');

const reg = (email, role) => request(app).post('/auth/register').send({ email, password: 'secret123', role });
const login = async (email) => (await request(app).post('/auth/login').send({ email, password: 'secret123' })).body.token;

test('register / duplicate / validation', async () => {
  expect((await reg('a@x.com')).status).toBe(201);
  expect((await reg('a@x.com')).status).toBe(409);
  expect((await request(app).post('/auth/register').send({ email: 'bad' })).status).toBe(400);
});

test('malformed token returns 401', async () => {
  const r = await request(app).get('/tasks').set('Authorization', 'Bearer not.a.jwt');
  expect(r.status).toBe(401);
});

test('ownership isolation + admin override + pagination', async () => {
  await reg('u1@x.com'); await reg('u2@x.com'); await reg('adm@x.com', 'admin');
  const t1 = await login('u1@x.com'), t2 = await login('u2@x.com'), ta = await login('adm@x.com');
  const created = [];
  for (let i = 0; i < 3; i++) {
    created.push((await request(app).post('/tasks').set('Authorization', `Bearer ${t1}`).send({ title: 'T' + i, status: 'todo' })).body);
  }
  const list = await request(app).get('/tasks?page=2&limit=2').set('Authorization', `Bearer ${t1}`);
  expect(list.body.total).toBe(3);
  expect(list.body.data).toHaveLength(1);
  expect((await request(app).get('/tasks').set('Authorization', `Bearer ${t2}`)).body.total).toBe(0);
  expect((await request(app).patch(`/tasks/${created[0].id}`).set('Authorization', `Bearer ${t2}`).send({ status: 'done' })).status).toBe(403);
  expect((await request(app).patch(`/tasks/${created[0].id}`).set('Authorization', `Bearer ${ta}`).send({ status: 'done' })).status).toBe(200);
  expect((await request(app).delete(`/tasks/${created[0].id}`).set('Authorization', `Bearer ${t1}`)).status).toBe(204);
  expect((await request(app).delete(`/tasks/${created[0].id}`).set('Authorization', `Bearer ${t1}`)).status).toBe(404);
});

test('rate limit: 6th attempt is 429 even with correct password, then window resets', async () => {
  await reg('rl@x.com');
  const realNow = Date.now;
  for (let i = 0; i < 5; i++) {
    expect((await request(app).post('/auth/login').send({ email: 'rl@x.com', password: 'wrong' })).status).toBe(401);
  }
  const blocked = await request(app).post('/auth/login').send({ email: 'rl@x.com', password: 'secret123' });
  expect(blocked.status).toBe(429);
  expect(blocked.headers['retry-after']).toBeDefined();
  Date.now = () => realNow() + 61000;
  expect((await request(app).post('/auth/login').send({ email: 'rl@x.com', password: 'secret123' })).status).toBe(200);
  Date.now = realNow;
});
