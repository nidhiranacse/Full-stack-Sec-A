const http = require('http');
const app = require('./server');

const TEST_PORT = 3199;
let server;

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseBody);
          } catch {
            parsed = responseBody;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING PRACTICAL B1 API AUTOMATED VERIFICATION ---');
  server = app.listen(TEST_PORT);

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, actual) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} -> Actual:`, actual);
      failed++;
    }
  }

  try {
    // 1. Missing username
    let res = await request('POST', '/register', { password: 'password123' });
    assert(
      'POST /register (missing username) -> 400 { "error": "Invalid input" }',
      res.status === 400 && res.data.error === 'Invalid input',
      res
    );

    // 2. Empty username
    res = await request('POST', '/register', { username: '   ', password: 'password123' });
    assert(
      'POST /register (empty username) -> 400 { "error": "Invalid input" }',
      res.status === 400 && res.data.error === 'Invalid input',
      res
    );

    // 3. Password shorter than 6 characters
    res = await request('POST', '/register', { username: 'alice', password: '123' });
    assert(
      'POST /register (short password) -> 400 { "error": "Invalid input" }',
      res.status === 400 && res.data.error === 'Invalid input',
      res
    );

    // 4. Missing password
    res = await request('POST', '/register', { username: 'alice' });
    assert(
      'POST /register (missing password) -> 400 { "error": "Invalid input" }',
      res.status === 400 && res.data.error === 'Invalid input',
      res
    );

    // 5. Successful registration
    res = await request('POST', '/register', { username: 'alice', password: 'password123' });
    assert(
      'POST /register (valid) -> 201 { "message": "User registered" }',
      res.status === 201 && res.data.message === 'User registered',
      res
    );

    // 6. Username already taken
    res = await request('POST', '/register', { username: 'alice', password: 'password456' });
    assert(
      'POST /register (duplicate) -> 409 { "error": "Username already exists" }',
      res.status === 409 && res.data.error === 'Username already exists',
      res
    );

    // 7. Login with unknown user
    res = await request('POST', '/login', { username: 'unknown_bob', password: 'password123' });
    assert(
      'POST /login (unknown user) -> 401 { "error": "Invalid credentials" }',
      res.status === 401 && res.data.error === 'Invalid credentials',
      res
    );

    // 8. Login with wrong password
    res = await request('POST', '/login', { username: 'alice', password: 'wrongpassword' });
    assert(
      'POST /login (wrong password) -> 401 { "error": "Invalid credentials" }',
      res.status === 401 && res.data.error === 'Invalid credentials',
      res
    );

    // 9. Successful login
    res = await request('POST', '/login', { username: 'alice', password: 'password123' });
    assert(
      'POST /login (valid credentials) -> 200 { "token": "<jwt>" }',
      res.status === 200 && typeof res.data.token === 'string' && res.data.token.length > 20,
      res
    );
    const validToken = res.data.token;

    // 10. Profile without Authorization header
    res = await request('GET', '/profile');
    assert(
      'GET /profile (missing header) -> 401 { "error": "Unauthorized" }',
      res.status === 401 && res.data.error === 'Unauthorized',
      res
    );

    // 11. Profile with malformed token
    res = await request('GET', '/profile', null, { Authorization: 'Bearer invalid.token.value' });
    assert(
      'GET /profile (malformed token) -> 401 { "error": "Unauthorized" }',
      res.status === 401 && res.data.error === 'Unauthorized',
      res
    );

    // 12. Profile with valid token
    res = await request('GET', '/profile', null, { Authorization: `Bearer ${validToken}` });
    assert(
      'GET /profile (valid token) -> 200 { "username": "alice" }',
      res.status === 200 && res.data.username === 'alice',
      res
    );

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
