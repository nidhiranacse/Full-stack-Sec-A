const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_secret_key_cu24250263';

// Mock in-memory user list for instant evaluation
const demoUsers = [
  { id: '1', email: 'admin@campus.edu', name: 'Pulkit Goyal (Admin)', role: 'admin', cuid: 'CU24250263' },
  { id: '2', email: 'student@campus.edu', name: 'Pulkit Goyal (Student)', role: 'student', cuid: 'CU24250263' }
];

router.post('/login', (req, res) => {
  const { email } = req.body;
  const user = demoUsers.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || demoUsers[0];

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, cuid: user.cuid },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user
  });
});

module.exports = router;
