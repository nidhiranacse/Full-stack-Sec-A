const bcrypt = require('bcrypt');

const db = {
  users: [
    { _id: '1', name: 'Admin User', email: 'admin@campus.edu', passwordHash: '$2b$10$7R9I6P2W7Q4R5T8U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8', role: 'ADMIN' }, // pw: admin123
    { _id: '2', name: 'Student User', email: 'student@campus.edu', passwordHash: '$2b$10$7R9I6P2W7Q4R5T8U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8', role: 'STUDENT' } // pw: student123
  ],
  events: [],
  announcements: [],
  nextUserId: 3,
  nextEventId: 1,
  nextAnnouncementId: 1
};

// Update existing mock passwords to be valid for bcrypt
const hashPasswords = async () => {
  db.users[0].passwordHash = await bcrypt.hash('admin123', 10);
  db.users[1].passwordHash = await bcrypt.hash('student123', 10);
};
hashPasswords();

const connectDB = async () => {
  console.log("In-memory storage ready (No MongoDB needed)");
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports = { connectDB, db, comparePassword, hashPassword };