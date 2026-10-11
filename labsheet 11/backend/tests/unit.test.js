// Unit tests (Jest) - Radha Pandey, CSE
const jwt = require('jsonwebtoken');
const { validateSignup, validateEvent } = require('../src/utils/validators');
const { seatsLeft } = require('../src/utils/events');
const { authenticate, authorize } = require('../src/middleware/auth');

describe('validators', () => {
  test('1. signup rejects bad email / short password and accepts valid input', () => {
    expect(validateSignup({ name: 'A', email: 'nope', password: '123' }).length).toBe(3);
    expect(validateSignup({ name: 'Radha Pandey', email: 'r@x.com', password: 'secret1' })).toEqual([]);
  });

  test('2. event validation rejects bad category, capacity and date', () => {
    const { errors } = validateEvent({ title: 'Hack', category: 'party', date: 'x', venue: 'Hall', capacity: 0 });
    expect(errors.length).toBe(3);
    const ok = validateEvent({ title: 'Hackathon', category: 'hackathon', date: '2030-01-01T10:00', venue: 'Hall', capacity: '50' });
    expect(ok.errors).toEqual([]);
    expect(ok.values.capacity).toBe(50);
  });
});

describe('seat availability', () => {
  test('3. seatsLeft never goes below zero', () => {
    expect(seatsLeft(10, 3)).toBe(7);
    expect(seatsLeft(10, 10)).toBe(0);
    expect(seatsLeft(5, 9)).toBe(0);
  });
});

describe('auth middleware', () => {
  const run = (mw, req) => {
    const next = jest.fn();
    mw(req, {}, next);
    return next.mock.calls[0][0];
  };

  test('4. authenticate: valid token sets req.user, malformed token gives 401', () => {
    const token = jwt.sign({ id: 7, role: 'student', name: 'R' }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    expect(run(authenticate, req)).toBeUndefined();
    expect(req.user).toEqual({ id: 7, role: 'student', name: 'R' });
    expect(run(authenticate, { headers: { authorization: 'Bearer garbage' } }).status).toBe(401);
    expect(run(authenticate, { headers: {} }).status).toBe(401);
  });

  test('5. authorize (RBAC): student blocked from admin route, admin allowed', () => {
    expect(run(authorize('admin'), { user: { role: 'student' } }).status).toBe(403);
    expect(run(authorize('admin'), { user: { role: 'admin' } })).toBeUndefined();
  });
});
