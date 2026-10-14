const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function openDb(filename = process.env.DB_PATH || path.join(__dirname, '../../booknest.sqlite')) {
  const db = await open({ filename, driver: sqlite3.Database });
  await db.exec('PRAGMA foreign_keys = ON;');
  await db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  return db;
}
module.exports = { openDb };
