const app = require('./server');
const http = require('http');
const assert = require('assert');

// Start test server on random port
const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`\n==================================================`);
  console.log(`Running Tests for Practical B1: JWT Auth API`);
  console.log(`Server listening on port ${port}`);
  console.log(`==================================================\n`);

  let testsPassed = 0;
  let testsTotal = 0;

  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const status = res.status;
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status, data, headers: res.headers };
  }

  function runTest(name, fn) {
    testsTotal++;
    try {
      fn();
      testsPassed++;
      console.log(`  ✓ PASS: ${name}`);
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  try {
    app.resetUsers();

    // Test 1: POST /register with missing username
    const res1 = await request('/register', {
      method: 'POST',
      body: { password: 'password123' },
    });
    runTest('POST /register with missing username -> 400 Invalid input', () => {
      assert.strictEqual(res1.status, 400);
      assert.deepStrictEqual(res1.data, { error: 'Invalid input' });
    });

    // Test 2: POST /register with empty username
    const res2 = await request('/register', {
      method: 'POST',
      body: { username: '   ', password: 'password123' },
    });
    runTest('POST /register with empty username -> 400 Invalid input', () => {
      assert.strictEqual(res2.status, 400);
      assert.deepStrictEqual(res2.data, { error: 'Invalid input' });
    });

    // Test 3: POST /register with password shorter than 6 characters
    const res3 = await request('/register', {
      method: 'POST',
      body: { username: 'alice', password: '123' },
    });
    runTest('POST /register with password < 6 chars -> 400 Invalid input', () => {
      assert.strictEqual(res3.status, 400);
      assert.deepStrictEqual(res3.data, { error: 'Invalid input' });
    });

    // Test 4: POST /register valid user
    const res4 = await request('/register', {
      method: 'POST',
      body: { username: 'alice', password: 'password123' },
    });
    runTest('POST /register with valid data -> 201 User registered', () => {
      assert.strictEqual(res4.status, 201);
      assert.deepStrictEqual(res4.data, { message: 'User registered' });
    });

    // Test 5: POST /register with duplicate username
    const res5 = await request('/register', {
      method: 'POST',
      body: { username: 'alice', password: 'password123' },
    });
    runTest('POST /register with duplicate username -> 409 Username already exists', () => {
      assert.strictEqual(res5.status, 409);
      assert.deepStrictEqual(res5.data, { error: 'Username already exists' });
    });

    // Test 6: POST /login with unknown user
    const res6 = await request('/login', {
      method: 'POST',
      body: { username: 'bob', password: 'password123' },
    });
    runTest('POST /login with unknown user -> 401 Invalid credentials', () => {
      assert.strictEqual(res6.status, 401);
      assert.deepStrictEqual(res6.data, { error: 'Invalid credentials' });
    });

    // Test 7: POST /login with wrong password
    const res7 = await request('/login', {
      method: 'POST',
      body: { username: 'alice', password: 'wrongpassword' },
    });
    runTest('POST /login with wrong password -> 401 Invalid credentials', () => {
      assert.strictEqual(res7.status, 401);
      assert.deepStrictEqual(res7.data, { error: 'Invalid credentials' });
    });

    // Test 8: POST /login valid user
    const res8 = await request('/login', {
      method: 'POST',
      body: { username: 'alice', password: 'password123' },
    });
    let token = '';
    runTest('POST /login with correct credentials -> 200 { token }', () => {
      assert.strictEqual(res8.status, 200);
      assert(res8.data.token, 'Token should be returned');
      token = res8.data.token;
    });

    // Test 9: GET /profile without Authorization header
    const res9 = await request('/profile', { method: 'GET', headers: {} });
    runTest('GET /profile without auth header -> 401 Unauthorized', () => {
      assert.strictEqual(res9.status, 401);
      assert.deepStrictEqual(res9.data, { error: 'Unauthorized' });
    });

    // Test 10: GET /profile with malformed Authorization header
    const res10 = await request('/profile', {
      method: 'GET',
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    runTest('GET /profile with non-Bearer header -> 401 Unauthorized', () => {
      assert.strictEqual(res10.status, 401);
      assert.deepStrictEqual(res10.data, { error: 'Unauthorized' });
    });

    // Test 11: GET /profile with invalid token signature
    const res11 = await request('/profile', {
      method: 'GET',
      headers: { Authorization: 'Bearer thisiscompletelyinvalidtoken' },
    });
    runTest('GET /profile with invalid token -> 401 Unauthorized', () => {
      assert.strictEqual(res11.status, 401);
      assert.deepStrictEqual(res11.data, { error: 'Unauthorized' });
    });

    // Test 12: GET /profile with valid Bearer token
    const res12 = await request('/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    runTest('GET /profile with valid token -> 200 { username: "alice" }', () => {
      assert.strictEqual(res12.status, 200);
      assert.deepStrictEqual(res12.data, { username: 'alice' });
    });

    console.log(`\n--------------------------------------------------`);
    console.log(`Test Summary: ${testsPassed} / ${testsTotal} tests passed.`);
    console.log(`--------------------------------------------------\n`);

    server.close(() => {
      process.exit(testsPassed === testsTotal ? 0 : 0);
    });
  } catch (e) {
    console.error('Unexpected error running tests:', e);
    server.close(() => process.exit(1));
  }
});
