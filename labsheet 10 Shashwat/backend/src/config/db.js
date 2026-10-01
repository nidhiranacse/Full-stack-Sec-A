const low      = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs   = require('fs');

let db;

function getDb() {
  if (!db) {
    const dbPath =
      process.env.DB_PATH ||
      path.join(__dirname, '../../data/campusconnect.json');

    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const adapter = new FileSync(dbPath);
    db = low(adapter);

    db.defaults({
      users:         [],
      events:        [],
      rsvps:         [],
      announcements: [],
    }).write();
  }
  return db;
}

/** Reset singleton (used in tests). */
function closeDb() {
  db = null;
}

/**
 * Seed demo accounts if they don't already exist.
 * Demo accounts:
 *   admin@campus.edu   / admin123   (ADMIN)
 *   student@campus.edu / student123 (STUDENT)
 */
async function seedDemoUsers() {
  const database = getDb();
  const demoUsers = [
    { name: 'Demo Admin',   email: 'admin@campus.edu',   password: 'admin123',   role: 'ADMIN'   },
    { name: 'Demo Student', email: 'student@campus.edu', password: 'student123', role: 'STUDENT' },
  ];

  for (const u of demoUsers) {
    const exists = database.get('users').find({ email: u.email }).value();
    if (!exists) {
      const hashed = await bcrypt.hash(u.password, 10);
      database.get('users').push({
        id:           uuidv4(),
        name:         u.name,
        email:        u.email,
        password:     hashed,
        role:         u.role,
        refreshToken: null,
        createdAt:    new Date().toISOString(),
      }).write();
      console.log(`🌱 Seeded demo user: ${u.email}`);
    }
  }
}

/** Initialise DB and seed demo users. */
async function initDb() {
  getDb();
  await seedDemoUsers();
  console.log('✅ LowDB (JSON) database ready');
}

module.exports = { getDb, closeDb, initDb };
