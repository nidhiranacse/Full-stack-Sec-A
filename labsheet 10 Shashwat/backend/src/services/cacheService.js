const NodeCache = require('node-cache');

/**
 * In-process memory cache (replaces Redis for simplicity).
 * Default TTL: 60 seconds. Stale checks every 30 seconds.
 */
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

/**
 * Invalidates all cache entries whose key starts with `prefix`.
 * Called whenever events are created, updated, or deleted.
 */
function invalidateCache(prefix) {
  const keysToDelete = cache.keys().filter((k) => k.startsWith(prefix));
  if (keysToDelete.length) cache.del(keysToDelete);
}

module.exports = { cache, invalidateCache };
