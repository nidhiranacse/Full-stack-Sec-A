/**
 * Response-Time Benchmarking Tool (Task 3)
 * Compares average response times for 100 cached vs. uncached requests to /api/events
 * Candidate: Rahul Raj (cu24250116)
 * Course: Full Stack Web Development (Sec-A)
 */

const http = require('node:http');
const { app, server } = require('./backend/src/server');
const { cache, EVENTS_CACHE_KEY } = require('./backend/src/config/redis');

const PORT = 4077;
const TOTAL_REQUESTS = 100;

function measureRequest(path) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const req = http.get({
      hostname: '127.0.0.1',
      port: PORT,
      path: path
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        resolve({
          status: res.statusCode,
          cacheHeader: res.headers['x-cache-status'],
          durationMs
        });
      });
    });
    req.on('error', reject);
  });
}

async function runBenchmark() {
  console.log('================================================================');
  console.log(' CAMPUSCONNECT: REDIS CACHING PERFORMANCE BENCHMARK (TASK 3)');
  console.log(` Executing ${TOTAL_REQUESTS} requests across uncached vs cached pipelines`);
  console.log(' Candidate: Rahul Raj | cu24250116 | Full-stack Sec-A');
  console.log('================================================================\n');

  const benchServer = server.listen(PORT);

  try {
    // 1. Uncached Requests (forcing cache invalidation each time)
    console.log(`[1/2] Benchmarking ${TOTAL_REQUESTS} Uncached Requests (Database Fetch)...`);
    const uncachedTimes = [];
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
      await cache.del(EVENTS_CACHE_KEY);
      const res = await measureRequest('/api/events');
      uncachedTimes.push(res.durationMs);
    }
    const avgUncached = (uncachedTimes.reduce((a, b) => a + b, 0) / TOTAL_REQUESTS).toFixed(3);
    const minUncached = Math.min(...uncachedTimes).toFixed(3);
    const maxUncached = Math.max(...uncachedTimes).toFixed(3);

    // 2. Cached Requests (Redis HIT)
    console.log(`[2/2] Benchmarking ${TOTAL_REQUESTS} Cached Requests (Redis Cache HIT)...`);
    // Seed cache once
    await measureRequest('/api/events');
    const cachedTimes = [];
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
      const res = await measureRequest('/api/events');
      cachedTimes.push(res.durationMs);
    }
    const avgCached = (cachedTimes.reduce((a, b) => a + b, 0) / TOTAL_REQUESTS).toFixed(3);
    const minCached = Math.min(...cachedTimes).toFixed(3);
    const maxCached = Math.max(...cachedTimes).toFixed(3);

    const speedup = (avgUncached / avgCached).toFixed(2);
    const latencyReduction = (((avgUncached - avgCached) / avgUncached) * 100).toFixed(1);

    console.log('\n----------------------------------------------------------------');
    console.log(' BENCHMARK RESULTS TABLE:');
    console.log('----------------------------------------------------------------');
    console.log(` Pipeline          | Avg (ms) | Min (ms) | Max (ms) | Cache Status`);
    console.log('-------------------+----------+----------+----------+-------------');
    console.log(` Uncached (DB)     | ${avgUncached.padStart(8)} | ${minUncached.padStart(8)} | ${maxUncached.padStart(8)} | MISS`);
    console.log(` Cached (Redis)    | ${avgCached.padStart(8)} | ${minCached.padStart(8)} | ${maxCached.padStart(8)} | HIT (TTL 60s)`);
    console.log('----------------------------------------------------------------');
    console.log(` Performance Gain : ${speedup}x faster with Redis caching`);
    console.log(` Latency Reduction: ${latencyReduction}% reduction in request round-trip time`);
    console.log('================================================================\n');

  } finally {
    benchServer.close();
    process.exit(0);
  }
}

runBenchmark().catch(err => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
