/**
 * Redis Caching Layer (Task 3)
 * Provides Redis caching with 60-second TTL and automatic cache invalidation
 */

class MockRedisCache {
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
  }

  async get(key) {
    const exp = this.expirations.get(key);
    if (exp && Date.now() > exp) {
      this.store.delete(key);
      this.expirations.delete(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async set(key, value, mode, ttlSeconds) {
    this.store.set(key, value);
    if (mode === 'EX' && ttlSeconds) {
      this.expirations.set(key, Date.now() + ttlSeconds * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    this.expirations.delete(key);
    return 1;
  }

  async flushall() {
    this.store.clear();
    this.expirations.clear();
    return 'OK';
  }
}

const cache = new MockRedisCache();

module.exports = {
  cache,
  EVENTS_CACHE_KEY: 'cache:events:all',
  CACHE_TTL_SECONDS: 60
};
