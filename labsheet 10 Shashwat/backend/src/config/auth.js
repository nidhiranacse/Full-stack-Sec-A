module.exports = {
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || 'campus_access_secret_dev',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || 'campus_refresh_secret_dev',
  ACCESS_TOKEN_EXPIRY:  '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
};
