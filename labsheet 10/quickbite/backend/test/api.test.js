'use strict';
// Run with:  npm test        (uses Node's built-in test runner, in-memory DB)
process.env.NODE_ENV = 'test';
process.env.DB_FILE = ':memory:';

const test = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../app');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

async function call(method, path, body, rawBody) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch (e) { /* no body */ }
  return { status: res.status, body: json };
}

const validOrder = (items) => ({
  customerName: 'Asha',
  phone: '9876543210',
  address: '12 MG Road, Jaipur',
  items
});

let tikka, soda, lassi;

test('POST /api/items creates items (201) and validates (400)', async () => {
  let r = await call('POST', '/api/items', { name: 'Paneer Tikka', price: 180, category: 'Starters' });
  assert.equal(r.status, 201);
  assert.equal(r.body.isAvailable, true);
  tikka = r.body;

  r = await call('POST', '/api/items', { name: 'Fresh Lime Soda', price: '60', category: 'Drinks' });
  assert.equal(r.status, 201);
  assert.equal(r.body.price, 60);
  soda = r.body;

  r = await call('POST', '/api/items', { name: 'Mango Lassi', price: 90, category: 'Drinks', isAvailable: false });
  assert.equal(r.status, 201);
  assert.equal(r.body.isAvailable, false);
  lassi = r.body;

  // default category
  r = await call('POST', '/api/items', { name: 'Plain Rice', price: 50 });
  assert.equal(r.status, 201);
  assert.equal(r.body.category, 'Main Course');

  for (const bad of [
    {},
    { name: '', price: 10 },
    { name: '   ', price: 10 },
    { name: 'X' },
    { name: 'X', price: 0 },
    { name: 'X', price: -5 },
    { name: 'X', price: 'abc' },
    { name: 'X', price: null },
    { name: 'X', price: 10, isAvailable: 'yes' }
  ]) {
    r = await call('POST', '/api/items', bad);
    assert.equal(r.status, 400, JSON.stringify(bad));
    assert.ok(r.body.error);
  }
});

test('GET /api/items supports search and category filters', async () => {
  let r = await call('GET', '/api/items');
  assert.equal(r.status, 200);
  assert.equal(r.body.length, 4);

  r = await call('GET', '/api/items?search=PANEER');
  assert.deepEqual(r.body.map((i) => i.name), ['Paneer Tikka']);

  r = await call('GET', '/api/items?category=drinks');
  assert.deepEqual(r.body.map((i) => i.name).sort(), ['Fresh Lime Soda', 'Mango Lassi']);

  r = await call('GET', '/api/items?search=lime&category=Drinks');
  assert.equal(r.body.length, 1);

  r = await call('GET', '/api/items?search=%25');   // wildcard chars are literal
  assert.equal(r.status, 200);
  assert.equal(r.body.length, 0);
});

test('PUT /api/items/:id updates, validates and 404s', async () => {
  let r = await call('PUT', `/api/items/${tikka.id}`, { price: 200 });
  assert.equal(r.status, 200);
  assert.equal(r.body.price, 200);
  assert.equal(r.body.name, 'Paneer Tikka');          // untouched field is kept

  r = await call('PUT', `/api/items/${tikka.id}`, { price: -1 });
  assert.equal(r.status, 400);

  r = await call('PUT', '/api/items/99999', { price: 10 });
  assert.equal(r.status, 404);

  r = await call('PUT', '/api/items/abc', { price: 10 });
  assert.equal(r.status, 404);
});

test('POST /api/orders - validation errors return 400', async () => {
  const bads = [
    {},
    validOrder([]),
    { ...validOrder([{ itemId: tikka.id, qty: 1 }]), customerName: '' },
    { ...validOrder([{ itemId: tikka.id, qty: 1 }]), phone: '12345' },
    { ...validOrder([{ itemId: tikka.id, qty: 1 }]), phone: 'abcdefghij' },
    { ...validOrder([{ itemId: tikka.id, qty: 1 }]), address: ' ' },
    validOrder([{ itemId: tikka.id, qty: 0 }]),
    validOrder([{ itemId: tikka.id, qty: -2 }]),
    validOrder([{ itemId: tikka.id, qty: 1.5 }]),
    validOrder([{ itemId: tikka.id }]),
    validOrder([{ qty: 1 }]),
    validOrder('not-an-array')
  ];
  for (const b of bads) {
    const r = await call('POST', '/api/orders', b);
    assert.equal(r.status, 400, JSON.stringify(b));
    assert.ok(r.body.error);
  }
});

test('POST /api/orders - unavailable / non-existent items are rejected clearly', async () => {
  let r = await call('POST', '/api/orders', validOrder([{ itemId: lassi.id, qty: 1 }]));
  assert.equal(r.status, 400);
  assert.match(r.body.error, /Mango Lassi.*unavailable/);

  r = await call('POST', '/api/orders', validOrder([{ itemId: 99999, qty: 1 }]));
  assert.equal(r.status, 400);
  assert.match(r.body.error, /does not exist/);

  // one bad item blocks the whole order
  r = await call('POST', '/api/orders', validOrder([
    { itemId: tikka.id, qty: 1 }, { itemId: lassi.id, qty: 1 }
  ]));
  assert.equal(r.status, 400);
  r = await call('GET', '/api/orders');
  assert.equal(r.body.length, 0);
});

let order1, order2;

test('POST /api/orders - total is computed on the server from DB prices', async () => {
  const body = validOrder([
    { itemId: tikka.id, qty: 2, price: 1, name: 'HACKED' },   // client price ignored
    { itemId: soda.id, qty: 1 },
    { itemId: tikka.id, qty: 1 }                               // duplicate lines are merged
  ]);
  body.totalAmount = 1;                                        // ignored too
  const r = await call('POST', '/api/orders', body);
  assert.equal(r.status, 201);
  assert.equal(r.body.status, 'Placed');
  assert.equal(r.body.totalAmount, 200 * 3 + 60);
  assert.equal(r.body.items.length, 2);
  assert.deepEqual(r.body.items[0], { itemId: tikka.id, name: 'Paneer Tikka', price: 200, qty: 3 });
  assert.ok(r.body.createdAt);
  order1 = r.body;

  const r2 = await call('POST', '/api/orders', validOrder([{ itemId: soda.id, qty: 2 }]));
  assert.equal(r2.status, 201);
  order2 = r2.body;
});

test('order keeps price snapshot when menu price changes later', async () => {
  await call('PUT', `/api/items/${soda.id}`, { price: 999 });
  const r = await call('GET', '/api/orders');
  const o = r.body.find((x) => x.id === order1.id);
  assert.equal(o.totalAmount, 660);
  const fresh = await call('POST', '/api/orders', validOrder([{ itemId: soda.id, qty: 1 }]));
  assert.equal(fresh.body.totalAmount, 999);                   // uses CURRENT price
  await call('PUT', `/api/items/${soda.id}`, { price: 60 });
});

test('GET /api/orders returns latest first', async () => {
  const r = await call('GET', '/api/orders');
  assert.equal(r.status, 200);
  const ids = r.body.map((o) => o.id);
  assert.deepEqual(ids, [...ids].sort((a, b) => b - a));
});

test('PATCH status: forward-only flow', async () => {
  const id = order1.id;
  const patch = (status) => call('PATCH', `/api/orders/${id}/status`, { status });

  let r = await patch('Delivered');                  // skipping steps not allowed
  assert.equal(r.status, 400);
  r = await patch('Placed');                         // same status not allowed
  assert.equal(r.status, 400);
  r = await patch('Bogus');
  assert.equal(r.status, 400);
  r = await call('PATCH', `/api/orders/${id}/status`, {});
  assert.equal(r.status, 400);

  r = await patch('Preparing');
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'Preparing');

  r = await patch('Placed');                         // backwards not allowed
  assert.equal(r.status, 400);

  r = await patch('Cancelled');                      // too late to cancel
  assert.equal(r.status, 400);
  assert.match(r.body.error, /only while its status is "Placed"/);

  r = await patch('Out for Delivery');
  assert.equal(r.status, 200);
  r = await patch('Delivered');
  assert.equal(r.status, 200);

  r = await patch('Preparing');                      // finished orders are locked
  assert.equal(r.status, 400);
});

test('PATCH status: cancel only while Placed, then locked', async () => {
  const id = order2.id;
  let r = await call('PATCH', `/api/orders/${id}/status`, { status: 'Cancelled' });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'Cancelled');

  r = await call('PATCH', `/api/orders/${id}/status`, { status: 'Preparing' });
  assert.equal(r.status, 400);

  r = await call('PATCH', '/api/orders/99999/status', { status: 'Preparing' });
  assert.equal(r.status, 404);
});

test('DELETE /api/items/:id (200 then 404)', async () => {
  let r = await call('DELETE', `/api/items/${lassi.id}`);
  assert.equal(r.status, 200);
  r = await call('DELETE', `/api/items/${lassi.id}`);
  assert.equal(r.status, 404);
  r = await call('GET', '/api/items');
  assert.ok(!r.body.some((i) => i.id === lassi.id));
});

test('malformed JSON -> 400, unknown API route -> 404', async () => {
  let r = await call('POST', '/api/items', undefined, '{bad json');
  assert.equal(r.status, 400);
  assert.match(r.body.error, /Invalid JSON/);

  r = await call('GET', '/api/nope');
  assert.equal(r.status, 404);
});
