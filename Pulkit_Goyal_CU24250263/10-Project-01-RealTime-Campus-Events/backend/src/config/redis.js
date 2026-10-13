const { createClient } = require('redis');

const inMemoryStore = new Map();

let redisClient = {
  get: async (key) => inMemoryStore.get(key) || null,
  setEx: async (key, seconds, value) => {
    inMemoryStore.set(key, value);
    setTimeout(() => inMemoryStore.delete(key), seconds * 1000);
    return 'OK';
  },
  del: async (key) => inMemoryStore.delete(key),
  isReady: false
};

async function initRedis() {
  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  try {
    const client = createClient({ url });
    client.on('error', (err) => {
      // Keep silent fallback
    });
    await client.connect();
    console.log('✓ Redis Server Connected.');
    redisClient = client;
  } catch (err) {
    console.log('ℹ️ Redis server unavailable; falling back to high-speed in-memory cache.');
  }
}

initRedis();

module.exports = {
  getClient: () => redisClient
};
