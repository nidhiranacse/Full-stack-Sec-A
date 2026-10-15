const request = require('supertest');
const app = require('../server');

beforeEach(() => { app.resetState(); jest.useRealTimers(); });

async function signup(email, role) {
  await request(app).post('/auth/register').send({ email, password: 'secret123', role });
  const r = await request(app).post('/auth/login').send({ email, password: 'secret123' });
  return r.body.token;
}
const auth = (t) => ({ Authorization: `Bearer ${t}` });

test('register: 201, 400, 409', async () => {
  expect((await request(app).post('/auth/register').send({ email: 'a@x.com', password: 'secret123' })).status).toBe(201);
  expect((await request(app).post('/auth/register').send({ email: 'a@x.com', password: 'secret123' })).status).toBe(409);
  expect((await request(app).post('/auth/register').send({ email: 'bad', password: '1' })).status).toBe(400);
});

test('malformed token returns 401 and server survives', async () => {
  const r = await request(app).get('/tasks').set('Authorization', 'Bearer not.a.jwt');
  expect(r.status).toBe(401);
  expect((await request(app).get('/tasks')).status).toBe(401);
});

test('ownership isolation + admin override + pagination', async () => {
  const a = await signup('a@x.com'), b = await signup('b@x.com'), admin = await signup('adm@x.com', 'admin');
  for (let i = 0; i < 5; i++) await request(app).post('/tasks').set(auth(a)).send({ title: 't' + i, status: 'todo' });
  const created = await request(app).post('/tasks').set(auth(a)).send({ title: 'mine', status: 'done' });
  const id = created.body.id;

  const list = await request(app).get('/tasks?page=2&limit=4').set(auth(a));
  expect(list.body.total).toBe(6);
  expect(list.body.data.length).toBe(2);
  expect((await request(app).get('/tasks').set(auth(b))).body.total).toBe(0);

  expect((await request(app).patch('/tasks/' + id).set(auth(b)).send({ title: 'x' })).status).toBe(403);
  expect((await request(app).delete('/tasks/' + id).set(auth(b))).status).toBe(403);
  expect((await request(app).patch('/tasks/' + id).set(auth(admin)).send({ status: 'doing' })).status).toBe(200);
  expect((await request(app).delete('/tasks/' + id).set(auth(a))).status).toBe(204);
  expect((await request(app).delete('/tasks/' + id).set(auth(a))).status).toBe(404);
});

test('rate limit: 5 failures -> 429 even with correct password, resets after 1 min', async () => {
  await request(app).post('/auth/register').send({ email: 'r@x.com', password: 'secret123' });
  for (let i = 0; i < 5; i++) {
    expect((await request(app).post('/auth/login').send({ email: 'r@x.com', password: 'wrong' })).status).toBe(401);
  }
  const blocked = await request(app).post('/auth/login').send({ email: 'r@x.com', password: 'secret123' });
  expect(blocked.status).toBe(429);
  expect(blocked.headers['retry-after']).toBeDefined();

  const real = Date.now;
  Date.now = () => real() + 61000; // jump past the window
  const ok = await request(app).post('/auth/login').send({ email: 'r@x.com', password: 'secret123' });
  Date.now = real;
  expect(ok.status).toBe(200);
});
