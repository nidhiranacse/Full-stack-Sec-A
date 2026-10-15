/**
 * Integration Test Suite for CampusConnect (Task 6)
 * Validates:
 * 1. User registration
 * 2. Login failure on wrong password
 * 3. Protected route rejection without token (401)
 * 4. Admin-only route rejection for student role (403)
 * 5. Event creation success with admin role (201)
 * 6. Redis caching layer response & cache hit (Task 3)
 */

const http = require('node:http');
const { app, server } = require('../src/server');

const TEST_PORT = 4055;
let testServer;

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch { json = body; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('===================================================================');
  console.log(' CAMPUSCONNECT BACKEND INTEGRATION TEST SUITE (TASK 6)');
  console.log(' Candidate: Rahul Raj | cu24250116 | Full-stack Sec-A');
  console.log('===================================================================');

  testServer = server.listen(TEST_PORT);
  let passed = 0;
  const total = 6;

  let studentToken = null;
  let adminToken = null;

  try {
    // 1. User Registration
    console.log('\n[1/6] Testing User Registration (/api/auth/register)...');
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Integration Student',
      email: 'test_student@campus.edu',
      password: 'Password@123',
      role: 'STUDENT'
    });
    if (regRes.status === 201 && regRes.data.accessToken) {
      studentToken = regRes.data.accessToken;
      console.log('  --> [PASS] User registered and signed JWT token issued (201 Created)');
      passed++;
    } else {
      console.log(`  --> [FAIL] Status: ${regRes.status}, Message: ${regRes.data?.message}`);
    }

    // 2. Login failure on wrong password
    console.log('[2/6] Testing Login Failure on Incorrect Password...');
    const failRes = await request('POST', '/api/auth/login', {
      email: 'test_student@campus.edu',
      password: 'WrongPassword999'
    });
    if (failRes.status === 401) {
      console.log(`  --> [PASS] Rejected invalid credentials with 401 Unauthorized ("${failRes.data.message}")`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Expected 401, got ${failRes.status}`);
    }

    // Login as Admin to get Admin token
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@campus.edu',
      password: 'Admin@123'
    });
    adminToken = adminLoginRes.data.accessToken;

    // 3. Protected route rejection without token
    console.log('[3/6] Testing Protected Route Rejection Without Token (/api/events)...');
    const noTokenRes = await request('POST', '/api/events', {
      title: 'Unauthorized Event',
      description: 'Should fail'
    });
    if (noTokenRes.status === 401) {
      console.log(`  --> [PASS] Correctly rejected request lacking Authorization header (401 Unauthorized)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Expected 401, got ${noTokenRes.status}`);
    }

    // 4. Admin-only route rejection for Student role
    console.log('[4/6] Testing Admin-Only Route Rejection for Student Role (RBAC 403 Forbidden)...');
    const rbacRes = await request('POST', '/api/events', {
      title: 'Student Attempted Event',
      description: 'Should be 403 Forbidden'
    }, {
      'Authorization': `Bearer ${studentToken}`
    });
    if (rbacRes.status === 403) {
      console.log(`  --> [PASS] Correctly blocked Student role from Admin event creation (403 Forbidden)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Expected 403, got ${rbacRes.status}`);
    }

    // 5. Event creation success with Admin role
    console.log('[5/6] Testing Event Creation Success with Admin Role (201 Created)...');
    const createRes = await request('POST', '/api/events', {
      title: 'Verified Grand AI Hackathon',
      description: 'Official university tech fest event.',
      category: 'Hackathon',
      capacity: 250
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    if (createRes.status === 201 && createRes.data.data?.id) {
      console.log(`  --> [PASS] Admin successfully created event #${createRes.data.data.id} (201 Created)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Expected 201, got ${createRes.status}`);
    }

    // 6. Redis Caching Layer Verification (Task 3)
    console.log('[6/6] Testing Redis Caching Layer & X-Cache-Status Header...');
    // Initial fetch populates cache (MISS)
    await request('GET', '/api/events');
    // Subsequent fetch hits cache (HIT)
    const cacheHitRes = await request('GET', '/api/events');
    if (cacheHitRes.status === 200 && cacheHitRes.headers['x-cache-status'] === 'HIT') {
      console.log(`  --> [PASS] Response served from Redis Cache (X-Cache-Status: HIT, 60s TTL)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Cache hit not detected: status ${cacheHitRes.status}, header ${cacheHitRes.headers['x-cache-status']}`);
    }

    console.log('\n-------------------------------------------------------------------');
    console.log(` Diagnostic Summary: ${passed}/${total} integration tests passed.`);
    if (passed === total) {
      console.log(' ALL CAMPUSCONNECT BACKEND REQUIREMENTS (TASKS 1, 2, 3, 5, 6) VERIFIED!\n');
    }
  } finally {
    testServer.close();
    process.exit(passed === total ? 0 : 1);
  }
}

runTests().catch(err => {
  console.error('Test runner failure:', err);
  if (testServer) testServer.close();
  process.exit(1);
});
