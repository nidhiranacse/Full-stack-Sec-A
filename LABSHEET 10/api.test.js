import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import Database from 'better-sqlite3'
import { createApp } from './index.js'
import { initializeDatabase } from './database.js'

let db
let server
let baseUrl

beforeEach(async () => {
  db = new Database(':memory:')
  initializeDatabase(db)
  server = createApp(db).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  db.close()
})

async function login(email, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return response.json()
}

test('signup hashes the password and returns a student token', async () => {
  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Riya Shah', email: 'RIYA@campus.edu', password: 'password123' }),
  })
  const body = await response.json()
  assert.equal(response.status, 201)
  assert.equal(body.user.role, 'student')
  assert.notEqual(db.prepare('SELECT password_hash FROM users WHERE email = ?').get('riya@campus.edu').password_hash, 'password123')
})

test('signup rejects invalid input and duplicate email', async () => {
  const invalid = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'R', email: 'nope', password: 'short' }),
  })
  assert.equal(invalid.status, 400)
  const duplicate = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Aarav Mehta', email: 'student@campus.edu', password: 'password123' }),
  })
  assert.equal(duplicate.status, 409)
})

test('student credentials cannot create an event', async () => {
  const { token } = await login('student@campus.edu', 'Student123!')
  const response = await fetch(`${baseUrl}/api/events`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Not allowed', capacity: 20 }),
  })
  assert.equal(response.status, 403)
})

test('admin can create a validated event', async () => {
  const { token } = await login('admin@campus.edu', 'Admin123!')
  const response = await fetch(`${baseUrl}/api/events`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Test session', description: 'A practical session', category: 'Workshop', startsAt: '2027-01-10', startsTime: '10:00 AM', venue: 'Lab 1', capacity: 12 }),
  })
  assert.equal(response.status, 201)
  const { event } = await response.json()
  assert.equal(event.title, 'Test session')
  const invalidUpdate = await fetch(`${baseUrl}/api/events/${event.id}`, {
    method: 'PATCH', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ startsAt: '2026-02-31' }),
  })
  assert.equal(invalidUpdate.status, 400)
})

test('event registration is unique and reports seat counts', async () => {
  const { token } = await login('student@campus.edu', 'Student123!')
  const event = db.prepare('SELECT id FROM events LIMIT 1').get()
  const endpoint = `${baseUrl}/api/events/${event.id}/register`
  const first = await fetch(endpoint, { method: 'POST', headers: { authorization: `Bearer ${token}` } })
  const duplicate = await fetch(endpoint, { method: 'POST', headers: { authorization: `Bearer ${token}` } })
  const list = await fetch(`${baseUrl}/api/events?limit=1`)
  const page = await list.json()
  assert.equal(first.status, 201)
  assert.equal(duplicate.status, 409)
  assert.equal(page.events.length, 1)
  assert.equal(page.events[0].registration_count, 1)
  assert.equal(page.total, 5)
})