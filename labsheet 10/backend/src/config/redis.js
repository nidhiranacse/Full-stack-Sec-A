import Redis from 'ioredis';

let redisClient = null;
let isRedisConnected = false;

export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Unable to connect after 3 attempts. Caching fallback enabled (direct DB queries).');
          return null; // Stop retrying
        }
        return Math.min(times * 500, 2000);
      },
      lazyConnect: true
    });

    redisClient.connect().then(() => {
      isRedisConnected = true;
      console.log('[Redis] Connected successfully to Redis server');
    }).catch(err => {
      isRedisConnected = false;
      console.warn(`[Redis] Connection failed (${err.message}). Running in fallback mode without caching.`);
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
    });
  } catch (error) {
    console.warn(`[Redis] Initialization warning: ${error.message}`);
    isRedisConnected = false;
  }

  return redisClient;
};

export const getRedisClient = () => redisClient;
export const isCacheAvailable = () => isRedisConnected && redisClient?.status === 'ready';

// Helper for caching with fallback
export const getCachedData = async (key) => {
  if (!isCacheAvailable()) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`[Redis] Get cache error on key ${key}: ${err.message}`);
    return null;
  }
};

export const setCachedData = async (key, data, ttlSeconds = 60) => {
  if (!isCacheAvailable()) return;
  try {
    await redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.warn(`[Redis] Set cache error on key ${key}: ${err.message}`);
  }
};

export const invalidateCachePattern = async (pattern) => {
  if (!isCacheAvailable()) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`[Redis] Invalidated cache keys for pattern: ${pattern} (${keys.length} keys)`);
    }
  } catch (err) {
    console.warn(`[Redis] Invalidate cache error on pattern ${pattern}: ${err.message}`);
  }
};
