const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { maxRetriesPerRequest: 2 });
redis.on('error', (e) => console.error('[redis] error:', e.message));
module.exports = redis;
