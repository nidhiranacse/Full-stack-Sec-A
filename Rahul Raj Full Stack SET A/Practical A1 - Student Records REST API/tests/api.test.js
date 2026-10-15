const { test, describe, beforeEach, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const studentStore = require('../src/studentStore');

let server;
let baseUrl;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {}
    };

    let payload = null;
    if (body !== null) {
      payload = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let json = null;
        if (rawData) {
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = rawData;
          }
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
          rawBody: rawData
        });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

beforeEach(() => {
  studentStore.reset();
});

describe('Practical A1: Student Records REST API Test Suite', () => {

  describe('1. POST /students - Creation & Validation', () => {
    test('Valid input responds 201 with created student and auto-increment ID starting at 1', async () => {
      const res1 = await request('POST', '/students', {
        name: 'Rahul Raj',
        email: 'rahul@example.com',
        age: 21
      });

      assert.equal(res1.status, 201);
      assert.deepEqual(res1.body, {
        id: 1,
        name: 'Rahul Raj',
        email: 'rahul@example.com',
        age: 21
      });

      const res2 = await request('POST', '/students', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 22
      });

      assert.equal(res2.status, 201);
      assert.equal(res2.body.id, 2);
      assert.equal(res2.body.name, 'Jane Doe');
      assert.equal(res2.body.email, 'jane@example.com');
      assert.equal(res2.body.age, 22);
    });

    test('Invalid input: missing name responds 400 with { "error": "Invalid input" }', async () => {
      const res = await request('POST', '/students', {
        email: 'test@example.com',
        age: 20
      });

      assert.equal(res.status, 400);
      assert.deepEqual(res.body, { error: 'Invalid input' });
    });

    test('Invalid input: empty string name responds 400 with { "error": "Invalid input" }', async () => {
      const res = await request('POST', '/students', {
        name: '   ',
        email: 'test@example.com',
        age: 20
      });

      assert.equal(res.status, 400);
      assert.deepEqual(res.body, { error: 'Invalid input' });
    });

    test('Invalid input: invalid email format responds 400 with { "error": "Invalid input" }', async () => {
      const res = await request('POST', '/students', {
        name: 'Rahul',
        email: 'invalid-email-address',
        age: 20
      });

      assert.equal(res.status, 400);
      assert.deepEqual(res.body, { error: 'Invalid input' });
    });

    test('Invalid input: non-numeric or negative age responds 400 with { "error": "Invalid input" }', async () => {
      const resNeg = await request('POST', '/students', {
        name: 'Rahul',
        email: 'rahul@example.com',
        age: -5
      });
      assert.equal(resNeg.status, 400);
      assert.deepEqual(resNeg.body, { error: 'Invalid input' });

      const resZero = await request('POST', '/students', {
        name: 'Rahul',
        email: 'rahul@example.com',
        age: 0
      });
      assert.equal(resZero.status, 400);
      assert.deepEqual(resZero.body, { error: 'Invalid input' });

      const resStr = await request('POST', '/students', {
        name: 'Rahul',
        email: 'rahul@example.com',
        age: 'twenty'
      });
      assert.equal(resStr.status, 400);
      assert.deepEqual(resStr.body, { error: 'Invalid input' });
    });

    test('Duplicate email responds 409 with { "error": "Email already exists" }', async () => {
      const res1 = await request('POST', '/students', {
        name: 'First User',
        email: 'duplicate@test.com',
        age: 21
      });
      assert.equal(res1.status, 201);

      const resDuplicate = await request('POST', '/students', {
        name: 'Second User',
        email: 'duplicate@test.com',
        age: 23
      });
      assert.equal(resDuplicate.status, 409);
      assert.deepEqual(resDuplicate.body, { error: 'Email already exists' });
    });

    test('Duplicate email check is case-insensitive', async () => {
      await request('POST', '/students', {
        name: 'Case Test',
        email: 'testcase@domain.com',
        age: 21
      });

      const resCase = await request('POST', '/students', {
        name: 'Case Test 2',
        email: 'TESTCASE@domain.com',
        age: 22
      });
      assert.equal(resCase.status, 409);
      assert.deepEqual(resCase.body, { error: 'Email already exists' });
    });
  });

  describe('2. GET /students - Fetch List & Query Filtering', () => {
    test('Responds 200 with an empty array when no students exist', async () => {
      const res = await request('GET', '/students');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, []);
    });

    test('Responds 200 with all students in insertion order', async () => {
      await request('POST', '/students', { name: 'Student 1', email: 's1@test.com', age: 19 });
      await request('POST', '/students', { name: 'Student 2', email: 's2@test.com', age: 25 });
      await request('POST', '/students', { name: 'Student 3', email: 's3@test.com', age: 22 });

      const res = await request('GET', '/students');
      assert.equal(res.status, 200);
      assert.equal(res.body.length, 3);
      assert.equal(res.body[0].name, 'Student 1');
      assert.equal(res.body[1].name, 'Student 2');
      assert.equal(res.body[2].name, 'Student 3');
    });

    test('Query minAge filters students with age >= minAge', async () => {
      await request('POST', '/students', { name: 'Teen', email: 'teen@test.com', age: 18 });
      await request('POST', '/students', { name: 'Young', email: 'young@test.com', age: 21 });
      await request('POST', '/students', { name: 'Senior', email: 'senior@test.com', age: 28 });

      const resMin21 = await request('GET', '/students?minAge=21');
      assert.equal(resMin21.status, 200);
      assert.equal(resMin21.body.length, 2);
      assert.equal(resMin21.body[0].name, 'Young');
      assert.equal(resMin21.body[1].name, 'Senior');

      const resMin30 = await request('GET', '/students?minAge=30');
      assert.equal(resMin30.status, 200);
      assert.deepEqual(resMin30.body, []);
    });
  });

  describe('3. GET /students/:id - Fetch Single Student', () => {
    test('Responds 200 with student object when found', async () => {
      const created = await request('POST', '/students', {
        name: 'Target Student',
        email: 'target@test.com',
        age: 23
      });

      const res = await request('GET', `/students/${created.body.id}`);
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        id: created.body.id,
        name: 'Target Student',
        email: 'target@test.com',
        age: 23
      });
    });

    test('Responds 404 with { "error": "Student not found" } when ID does not exist', async () => {
      const res = await request('GET', '/students/999');
      assert.equal(res.status, 404);
      assert.deepEqual(res.body, { error: 'Student not found' });
    });
  });

  describe('4. DELETE /students/:id - Deletion & ID Non-Reuse Guarantee', () => {
    test('Responds 204 with empty body when deleting an existing student', async () => {
      const created = await request('POST', '/students', {
        name: 'To Delete',
        email: 'delete@test.com',
        age: 20
      });

      const resDel = await request('DELETE', `/students/${created.body.id}`);
      assert.equal(resDel.status, 204);
      assert.equal(resDel.rawBody, '');

      // Verify student is no longer retrievable
      const resFetch = await request('GET', `/students/${created.body.id}`);
      assert.equal(resFetch.status, 404);
      assert.deepEqual(resFetch.body, { error: 'Student not found' });
    });

    test('Responds 404 with { "error": "Student not found" } when deleting non-existent ID', async () => {
      const res = await request('DELETE', '/students/9999');
      assert.equal(res.status, 404);
      assert.deepEqual(res.body, { error: 'Student not found' });
    });

    test('Guarantees IDs of deleted students are NEVER reused', async () => {
      // 1. Create student with ID 1
      const s1 = await request('POST', '/students', { name: 'Student 1', email: 's1@test.com', age: 20 });
      assert.equal(s1.body.id, 1);

      // 2. Create student with ID 2
      const s2 = await request('POST', '/students', { name: 'Student 2', email: 's2@test.com', age: 21 });
      assert.equal(s2.body.id, 2);

      // 3. Delete student with ID 1
      const del1 = await request('DELETE', `/students/1`);
      assert.equal(del1.status, 204);

      // 4. Create new student: Must get ID 3, NOT ID 1!
      const s3 = await request('POST', '/students', { name: 'Student 3', email: 's3@test.com', age: 22 });
      assert.equal(s3.body.id, 3, 'ID of deleted student was reused! Expected 3, got ' + s3.body.id);

      // 5. Delete student 2 and 3
      await request('DELETE', `/students/2`);
      await request('DELETE', `/students/3`);

      // 6. Create student 4: Must get ID 4!
      const s4 = await request('POST', '/students', { name: 'Student 4', email: 's4@test.com', age: 24 });
      assert.equal(s4.body.id, 4, 'Expected ID 4 for next student after deletions');
    });
  });
});
