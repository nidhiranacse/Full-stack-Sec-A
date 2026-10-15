/**
 * Automated REST API Test Suite for Lab Sheet 09
 * Tests all 5 endpoints specified in syllabus section 5.
 * Student: Rahul Raj (cu24250116)
 * Course: Full Stack Web Development (Sec-A)
 */

const http = require('node:http');
const app = require('./server');

const TEST_PORT = 5055;
let server;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runApiTests() {
  console.log('===============================================================');
  console.log(' LAB SHEET 09: REST API AUTOMATED TEST SUITE');
  console.log(' Candidate: Rahul Raj | cu24250116 | Full-stack Sec-A');
  console.log('===============================================================');

  server = app.listen(TEST_PORT);
  let passed = 0;
  let total = 6;
  let createdId = null;

  try {
    // Test 1: GET /students
    console.log('\n[1/6] Testing GET /students (Fetch all student records)...');
    const getRes = await makeRequest('GET', '/students');
    if (getRes.status === 200 && Array.isArray(getRes.data.data)) {
      console.log(`  --> [PASS] Returned ${getRes.data.data.length} student records (Status 200)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Status: ${getRes.status}`);
    }

    // Test 2: POST /students
    console.log('[2/6] Testing POST /students (Add a new student record)...');
    const newStudent = {
      name: 'Test Candidate',
      rollNo: 'cu24250999',
      course: 'B.Tech Full Stack',
      marks: 96.5
    };
    const postRes = await makeRequest('POST', '/students', newStudent);
    if (postRes.status === 201 && postRes.data.data && postRes.data.data.id) {
      createdId = postRes.data.data.id;
      console.log(`  --> [PASS] Created student record with ID ${createdId} (Status 201)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Status: ${postRes.status}, Msg: ${postRes.data.message}`);
    }

    // Test 3: GET /students/:id
    console.log(`[3/6] Testing GET /students/${createdId} (Fetch single record by ID)...`);
    const getSingle = await makeRequest('GET', `/students/${createdId}`);
    if (getSingle.status === 200 && getSingle.data.data.rollNo === 'cu24250999') {
      console.log(`  --> [PASS] Fetched single student '${getSingle.data.data.name}' (Status 200)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Status: ${getSingle.status}`);
    }

    // Test 4: PUT /students/:id
    console.log(`[4/6] Testing PUT /students/${createdId} (Update existing student record)...`);
    const updatePayload = {
      name: 'Test Candidate Updated',
      marks: 99.0
    };
    const putRes = await makeRequest('PUT', `/students/${createdId}`, updatePayload);
    if (putRes.status === 200 && putRes.data.data.marks === 99.0) {
      console.log(`  --> [PASS] Updated student marks to 99.0% (Status 200)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Status: ${putRes.status}`);
    }

    // Test 5: Validation Enforcement (Marks > 100 rejected)
    console.log('[5/6] Testing Client/Server Validation (Reject marks > 100)...');
    const badPayload = { name: 'Bad Marks', rollNo: 'cu9999', course: 'Test', marks: 150 };
    const valRes = await makeRequest('POST', '/students', badPayload);
    if (valRes.status === 400) {
      console.log(`  --> [PASS] Correctly rejected invalid marks with 400 Bad Request: "${valRes.data.message}"`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Expected 400, got: ${valRes.status}`);
    }

    // Test 6: DELETE /students/:id
    console.log(`[6/6] Testing DELETE /students/${createdId} (Delete a student record)...`);
    const delRes = await makeRequest('DELETE', `/students/${createdId}`);
    if (delRes.status === 200) {
      console.log(`  --> [PASS] Deleted student ID ${createdId} successfully (Status 200)`);
      passed++;
    } else {
      console.log(`  --> [FAIL] Status: ${delRes.status}`);
    }

    console.log('\n---------------------------------------------------------------');
    console.log(` Test Summary: ${passed}/${total} REST API tests passed.`);
    if (passed === total) {
      console.log(' ALL LAB SHEET 09 ENDPOINTS VALIDATED SUCCESSFULLY!\n');
    }
  } finally {
    server.close();
    process.exit(passed === total ? 0 : 1);
  }
}

runApiTests().catch(err => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
