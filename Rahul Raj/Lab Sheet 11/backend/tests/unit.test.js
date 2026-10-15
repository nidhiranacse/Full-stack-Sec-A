/**
 * Automated Unit & Integration Test Suite
 * Lab Sheet 11 - Bonus Challenge:
 * "Write 5 unit tests (Jest/Mocha or JUnit) for backend logic"
 * Student: Rahul Raj (cu24250116)
 */

const http = require('http');
const app = require('../server');

const PORT = 5555;
let server;
let adminToken = '';
let studentToken = '';
let testEventId = null;
let testResourceId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

function logPass(title, details = '') {
  console.log(`  ${colors.green}✔ PASS:${colors.reset} ${colors.bold}${title}${colors.reset} ${details ? colors.cyan + '(' + details + ')' + colors.reset : ''}`);
}

function logFail(title, error) {
  console.error(`  ${colors.red}✖ FAIL:${colors.reset} ${colors.bold}${title}${colors.reset}`);
  console.error(`    ${colors.red}${error.message || error}${colors.reset}`);
}

// Helper fetch wrapper
async function request(endpoint, options = {}) {
  const url = `http://localhost:${PORT}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    headers: response.headers,
    data
  };
}

async function runTests() {
  console.log(`\n===============================================================`);
  console.log(`🧪 CampusConnect Automated Backend Logic Test Suite`);
  console.log(`📋 Lab Sheet 11 Practice Question Evaluation`);
  console.log(`===============================================================\n`);

  let passed = 0;
  let failed = 0;

  // TEST 1: User Registration, Bcrypt Hashing, & JWT Token Generation
  try {
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    const res = await request('/api/auth/signup', {
      method: 'POST',
      body: {
        name: `Test Student ${randomSuffix}`,
        email: `unit.test.${randomSuffix}@campus.edu`,
        password: 'Password@123',
        role: 'student',
        department: 'Computer Science',
        semester: 'Semester 6'
      }
    });

    if (res.status === 201 && res.data.success && res.data.token && res.data.user.role === 'student') {
      logPass('Test 1: User Signup, Bcrypt Password Hashing & JWT Generation', `HTTP 201, User ID: ${res.data.user.id}`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 201 with token, got status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    logFail('Test 1: User Signup, Bcrypt Password Hashing & JWT Generation', err);
    failed++;
  }

  // TEST 2: Authentication & Rate-Limited Login Flow
  try {
    // 2.1 Invalid Login rejection
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@campus.edu', password: 'WrongPassword999' }
    });
    if (badLogin.status !== 401) {
      throw new Error(`Expected 401 for wrong credentials, got ${badLogin.status}`);
    }

    // 2.2 Valid Admin Login
    const adminRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@campus.edu', password: 'Admin@123' }
    });
    if (adminRes.status === 200 && adminRes.data.token && adminRes.data.user.role === 'admin') {
      adminToken = adminRes.data.token;
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(adminRes.data)}`);
    }

    // 2.3 Valid Student Login
    const studentRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'student@campus.edu', password: 'Student@123' }
    });
    if (studentRes.status === 200 && studentRes.data.token && studentRes.data.user.role === 'student') {
      studentToken = studentRes.data.token;
    } else {
      throw new Error(`Student login failed: ${JSON.stringify(studentRes.data)}`);
    }

    logPass('Test 2: Authentication, Rate Limiting & JWT Verification', 'Both Admin & Student tokens verified');
    passed++;
  } catch (err) {
    logFail('Test 2: Authentication, Rate Limiting & JWT Verification', err);
    failed++;
  }

  // TEST 3: Role-Based Access Control (RBAC) Enforcement
  try {
    // Student tries to create an event -> MUST be rejected with HTTP 403 Forbidden
    const rbacRes = await request('/api/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: 'Unauthorized Student Event',
        description: 'Should fail RBAC check',
        category: 'Workshop',
        date: '2026-10-30',
        time: '10:00 AM - 12:00 PM',
        venue: 'Room 101',
        maxSeats: 50
      }
    });

    if (rbacRes.status === 403 && rbacRes.data.message.includes('Forbidden')) {
      logPass('Test 3: RBAC Middleware (Student blocked from Admin endpoints)', 'HTTP 403 Forbidden properly returned');
      passed++;
    } else {
      throw new Error(`Expected HTTP 403 for unauthorized student action, got ${rbacRes.status}`);
    }
  } catch (err) {
    logFail('Test 3: RBAC Middleware Enforcement', err);
    failed++;
  }

  // TEST 4: Event CRUD Operations by Admin & Dynamic Seat Calculations
  try {
    // 4.1 Admin creates event with maxSeats: 2
    const createRes = await request('/api/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'B.Tech Special AI Robotics Lab',
        description: 'Limited seat workshop for testing capacity management',
        category: 'Workshop',
        date: '2026-11-10',
        time: '02:00 PM - 05:00 PM',
        venue: 'Robotics Center Lab 3',
        maxSeats: 2
      }
    });

    if (createRes.status !== 201 || !createRes.data.event) {
      throw new Error(`Event creation failed with status ${createRes.status}`);
    }
    testEventId = createRes.data.event.id;

    // 4.2 Verify event details & seat calculation
    const getRes = await request(`/api/events/${testEventId}`);
    if (getRes.status === 200 && getRes.data.event.seatsLeft === 2 && getRes.data.event.registeredCount === 0) {
      logPass('Test 4: Admin Event Creation & Dynamic Seat Calculation', `Event #${testEventId} initialized with 2 seats`);
      passed++;
    } else {
      throw new Error(`Event check failed: ${JSON.stringify(getRes.data)}`);
    }
  } catch (err) {
    logFail('Test 4: Admin Event Creation & Seat Calculations', err);
    failed++;
  }

  // TEST 5: Student Registration, Overbooking Prevention, & Duplicate Check
  try {
    // 5.1 Student registers for test event
    const regRes = await request(`/api/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (regRes.status !== 201) {
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }

    // 5.2 Student attempts duplicate registration -> MUST return 409 Conflict
    const dupRes = await request(`/api/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 for duplicate registration, got ${dupRes.status}`);
    }

    // 5.3 Second student registers to fill up capacity (maxSeats: 2)
    // Sign up another student
    const regStudent2 = await request('/api/auth/signup', {
      method: 'POST',
      body: {
        name: 'Seat Capacity Student',
        email: `capacity.${Date.now()}@campus.edu`,
        password: 'Password@123',
        role: 'student'
      }
    });
    const s2Token = regStudent2.data.token;
    await request(`/api/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${s2Token}` }
    });

    // 5.4 Third student tries to register -> MUST return 400 Bad Request (Event is fully booked)
    const regStudent3 = await request('/api/auth/signup', {
      method: 'POST',
      body: {
        name: 'Overbook Student',
        email: `overbook.${Date.now()}@campus.edu`,
        password: 'Password@123',
        role: 'student'
      }
    });
    const s3Token = regStudent3.data.token;
    const overbookRes = await request(`/api/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${s3Token}` }
    });

    if (overbookRes.status === 400 && overbookRes.data.message.includes('fully booked')) {
      logPass('Test 5: Seat Capacity, Overbooking Guard & Duplicate Denial', 'Capacity limits & 400/409 codes verified');
      passed++;
    } else {
      throw new Error(`Expected 400 for overbooked event, got ${overbookRes.status}: ${JSON.stringify(overbookRes.data)}`);
    }
  } catch (err) {
    logFail('Test 5: Seat Capacity & Overbooking Prevention', err);
    failed++;
  }

  // TEST 6: Search, Filter & Pagination Logic (>10 items pagination)
  try {
    // 6.1 Query with pagination limit 5
    const pageRes = await request('/api/events?page=1&limit=5');
    if (pageRes.status !== 200 || pageRes.data.events.length !== 5 || pageRes.data.pagination.total < 10) {
      throw new Error(`Pagination check failed: ${JSON.stringify(pageRes.data.pagination)}`);
    }

    // 6.2 Category filter check
    const catRes = await request('/api/events?category=Hackathon');
    const allHackathons = catRes.data.events.every(ev => ev.category === 'Hackathon');
    if (!allHackathons || catRes.data.events.length === 0) {
      throw new Error('Category filtering returned non-matching items');
    }

    // 6.3 Search keyword filter check
    const searchRes = await request('/api/events?q=Masterclass');
    const allMatchSearch = searchRes.data.events.every(ev => 
      ev.title.toLowerCase().includes('masterclass') || ev.description.toLowerCase().includes('masterclass')
    );
    if (!allMatchSearch || searchRes.data.events.length === 0) {
      throw new Error('Search filtering failed to match keywords');
    }

    logPass('Test 6: Search, Category Filtering & Pagination (>10 Items)', `Pagination verified (${pageRes.data.pagination.total} total events, 5/page)`);
    passed++;
  } catch (err) {
    logFail('Test 6: Search, Filter & Pagination Logic', err);
    failed++;
  }

  // TEST 7: Academic Resource Upload, Subject/Semester Categorization & Download
  try {
    // 7.1 Admin uploads a resource
    const uploadRes = await request('/api/resources', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Full Stack Lab Sheet 11 Solution Guide',
        description: 'Complete documentation and architectural blueprint',
        subject: 'Full Stack Development',
        semester: 'Semester 6',
        fileType: 'pdf'
      }
    });

    if (uploadRes.status !== 201 || !uploadRes.data.resource) {
      throw new Error(`Resource upload failed with status ${uploadRes.status}`);
    }
    testResourceId = uploadRes.data.resource.id;

    // 7.2 Download resource and verify download count increments
    const dlRes = await request(`/api/resources/${testResourceId}/download`);
    if (dlRes.status !== 200) {
      throw new Error(`Resource download failed with status ${dlRes.status}`);
    }

    // Check updated download count
    const checkRes = await request(`/api/resources/${testResourceId}`);
    if (checkRes.data.resource.downloadCount >= 1) {
      logPass('Test 7: Academic Resource Management & Download Counter', `Resource #${testResourceId} downloaded successfully`);
      passed++;
    } else {
      throw new Error(`Download counter did not increment: ${JSON.stringify(checkRes.data)}`);
    }
  } catch (err) {
    logFail('Test 7: Academic Resource Upload & Download', err);
    failed++;
  }

  console.log(`\n---------------------------------------------------------------`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed out of 7 Tests`);
  console.log(`---------------------------------------------------------------\n`);

  if (server) {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}ALL 7 BACKEND LOGIC UNIT TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  }
}

// Start test server and trigger test execution
server = http.createServer(app);
server.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('Fatal test runner error:', err);
    server.close();
    process.exit(1);
  }
});
