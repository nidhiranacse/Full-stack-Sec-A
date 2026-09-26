// db.js — JSON File Database (no MongoDB needed)
// Stores all student data in data/students.json on disk.

const fs   = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto'); // built-in crypto for IDs

const DB_PATH = path.join(__dirname, 'data', 'students.json');

// ── Ensure data directory and file exist ──────────────────
function ensureDB() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// ── Read all records ──────────────────────────────────────
function readAll() {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw || '[]');
}

// ── Write all records ─────────────────────────────────────
function writeAll(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Generate unique ID (like MongoDB's _id) ───────────────
function generateId() {
  // Use crypto.randomUUID if available (Node 14.17+), else fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Simple fallback
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

module.exports = { readAll, writeAll, generateId };
