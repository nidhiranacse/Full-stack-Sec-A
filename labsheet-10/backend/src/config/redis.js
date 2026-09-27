const Redis = require('ioredis');

let redisClient = null;
let isConnected = false;

// Fallback in-memory cache if Redis server is unreachable in local environment
class InMemoryCache {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
    console.log('[Redis] Using resilient In-Memory fallback cache');
  }

  async get(key) {
    if (this.ttls.has(key)) {
      if (Date.now() > this.ttls.get(key)) {
        this.store.delete(key);
        this.ttls.delete(key);
        return null;
      }
    }
    const val = this.store.get(key);
    return val !== undefined ? val : null;
  }

  async set(key, value, mode, duration) {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      this.ttls.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.ttls.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }

  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matching = [];
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        if (!this.ttls.has(key) || Date.now() <= this.ttls.get(key)) {
          matching.push(key);
        }
      }
    }
    return matching;
  }

  async flushall() {
    this.store.clear();
    this.ttls.clear();
    return 'OK';
  }

  on() {}
}

const getRedisClient = () => {
  if (redisClient) return redisClient;

  if (process.env.NODE_ENV === 'test') {
    redisClient = new InMemoryCache();
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 2) {
          redisClient = new InMemoryCache();
          return null;
        }
        return Math.min(times * 100, 1000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    client.on('connect', () => {
      isConnected = true;
      console.log(`[Redis] Connected successfully to ${redisUrl}`);
    });

    client.on('error', (err) => {
      if (isConnected) {
        console.warn(`[Redis] Warning: ${err.message}`);
      }
      isConnected = false;
    });

    client.connect().catch(() => {
      redisClient = new InMemoryCache();
    });

    redisClient = client;
    return redisClient;
  } catch (error) {
    redisClient = new InMemoryCache();
    return redisClient;
  }
};

const invalidateCachePattern = async (pattern) => {
  try {
    const client = getRedisClient();
    let keys = [];
    if (typeof client.keys === 'function') {
      keys = await client.keys(pattern);
    }
    if (keys.length > 0) {
      if (typeof client.del === 'function') {
        await Promise.all(keys.map((k) => client.del(k)));
      }
      console.log(`[Redis Cache] Invalidated ${keys.length} keys matching "${pattern}"`);
    }
  } catch (err) {
    console.error(`[Redis Cache] Invalidation error for pattern ${pattern}:`, err.message);
  }
};

module.exports = {
  getRedisClient,
  invalidateCachePattern,
  InMemoryCache
};
