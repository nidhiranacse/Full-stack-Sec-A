const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users } = require('../store');
const { JWT_SECRET } = require('../middleware/auth');

// POST /auth/register
router.post('/register', (req, res) => {
  const { email, name, cuid, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'User with this email already exists' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    email: email.toLowerCase(),
    name,
    cuid: cuid || 'CU24250263',
    passwordHash: 'dummy_hash_' + password // In production, bcrypt.hashSync(password, 10)
  };

  users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, cuid: newUser.cuid }
  });
});

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, cuid: user.cuid }
  });
});

module.exports = router;
