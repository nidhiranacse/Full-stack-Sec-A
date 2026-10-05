import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'campus_connect_jwt_access_super_secret_key_2026_xyz';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'campus_connect_jwt_refresh_super_secret_key_2026_abc';

  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, accessSecret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });

  const refreshToken = jwt.sign({ id: user._id }, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

  return { accessToken, refreshToken };
};

// Helper to set refresh token httpOnly cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'STUDENT'
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user & issue tokens
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Refresh access token using refreshToken cookie
// @route   POST /api/auth/refresh
// @access  Public (Cookie required)
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing. Please log in again.'
      });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'campus_connect_jwt_refresh_super_secret_key_2026_abc';
    let decoded;
    try {
      decoded = jwt.verify(token, refreshSecret);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    const tokens = generateTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};
