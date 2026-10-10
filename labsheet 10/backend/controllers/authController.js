const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'STUDENT']).optional()
});

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'super_secret_access_key_12345',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET || 'super_secret_refresh_key_67890',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.errors });

  const { name, email, password, role } = result.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already registered.' });

  const user = await User.create({ name, email, passwordHash: password, role });
  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'Refresh token missing.' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET || 'super_secret_refresh_key_67890');
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'super_secret_access_key_12345',
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token.' });
  }
};