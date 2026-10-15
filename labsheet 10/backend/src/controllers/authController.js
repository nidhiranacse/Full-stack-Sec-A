const { db, comparePassword, hashPassword } = require('../config/db');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '365d' }
    );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET || 'refresh_secret_key',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = db.users.find(u => u.email === email);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await hashPassword(password);
    const user = {
      _id: String(db.nextUserId++),
      name,
      email,
      passwordHash,
      role: role || 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.push(user);
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh Token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refresh_secret_key');
    const user = db.users.find(u => u._id === decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token subject' });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '365d' }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired Refresh Token' });
  }
};

module.exports = { register, login, refresh };
