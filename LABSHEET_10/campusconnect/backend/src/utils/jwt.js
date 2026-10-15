const jwt = require('jsonwebtoken');

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me';

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email
    },
    ACCESS_SECRET,
    {
      expiresIn: '15m'
    }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      v: user.refreshTokenVersion || 0
    },
    REFRESH_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  ACCESS_SECRET,
  REFRESH_SECRET
};