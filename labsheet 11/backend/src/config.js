// Author: Radha Pandey, CSE - CampusConnect
require('dotenv').config();
const path = require('path');
const os = require('os');

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpires: '1d',
  databaseUrl: process.env.DATABASE_URL || null,
  dbSsl: process.env.DB_SSL === 'true',
  sqliteStorage: isTest
    ? ':memory:'
    : process.env.SQLITE_PATH || path.join(__dirname, '..', 'campusconnect.sqlite'),
  uploadDir:
    process.env.UPLOAD_DIR ||
    (isTest ? path.join(os.tmpdir(), 'campusconnect-test-uploads') : path.join(__dirname, '..', 'uploads')),
  clientUrl: process.env.CLIENT_URL || '*',
  loginRateLimit: isTest ? 1000 : 5, // failed attempts per minute per IP
  maxFileSize: 10 * 1024 * 1024,
};
