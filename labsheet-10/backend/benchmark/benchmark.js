const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/events';
const NUM_REQUESTS = 100;

const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        const cacheHeader = res.headers['x-cache'] || 'UNKNOWN';
        resolve({
          statusCode: res.statusCode,
          durationMs,
          cacheHeader,
        });
      });
    });

    req.on('error', (err) => reject(err));
  });
};

const calculateStats = (times) => {
  times.sort((a, b) => a - b);
  const sum = times.reduce((acc, val) => acc + val, 0);
  const mean = sum / times.length;
  const min = times[0];
  const max = times[times.length - 1];
  const p50 = times[Math.floor(times.length * 0.5)];
  const p90 = times[Math.floor(times.length * 0.9)];
  const p99 = times[Math.floor(times.length * 0.99)];

  return { mean, min, max, p50, p90, p99 };
};

const runBenchmark = async () => {
  console.log(`================================================================`);
  console.log(`  CampusConnect - Task 3: Redis Caching Layer Benchmark`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Sample size: ${NUM_REQUESTS} requests per scenario`);
  console.log(`================================================================\n`);

  try {
    // 1. Initial warm-up request
    console.log('1. Warming up cache with initial request...');
    const warmup = await makeRequest(BASE_URL);
    console.log(`   Warm-up status: ${warmup.statusCode} (${warmup.cacheHeader}) in ${warmup.durationMs.toFixed(2)}ms\n`);

    // 2. Benchmark Cached Requests (100 requests)
    console.log(`2. Benchmarking ${NUM_REQUESTS} CACHED requests (Cache HIT)...`);
    const cachedTimes = [];
    for (let i = 0; i < NUM_REQUESTS; i++) {
      const res = await makeRequest(BASE_URL);
      cachedTimes.push(res.durationMs);
    }
    const cachedStats = calculateStats(cachedTimes);
    console.log(`   -> Completed ${NUM_REQUESTS} cached requests.\n`);

    // 3. Benchmark Uncached Requests (100 requests with unique query params to bypass cache)
    console.log(`3. Benchmarking ${NUM_REQUESTS} UNCACHED requests (Cache MISS / DB Query)...`);
    const uncachedTimes = [];
    for (let i = 0; i < NUM_REQUESTS; i++) {
      const uniqueUrl = `${BASE_URL}?search=bench_${Date.now()}_${i}`;
      const res = await makeRequest(uniqueUrl);
      uncachedTimes.push(res.durationMs);
    }
    const uncachedStats = calculateStats(uncachedTimes);
    console.log(`   -> Completed ${NUM_REQUESTS} uncached requests.\n`);

    // 4. Comparison Summary
    const speedup = ((uncachedStats.mean - cachedStats.mean) / uncachedStats.mean) * 100;
    const factor = (uncachedStats.mean / cachedStats.mean).toFixed(2);

    console.log(`================================================================`);
    console.log(`                     BENCHMARK RESULTS REPORT`);
    console.log(`================================================================`);
    console.log(` Metric              | Uncached (MongoDB) | Cached (Redis/Cache)`);
    console.log(`----------------------------------------------------------------`);
    console.log(` Average (Mean) Time | ${uncachedStats.mean.toFixed(2).padStart(14)} ms | ${cachedStats.mean.toFixed(2).padStart(15)} ms`);
    console.log(` Min Latency         | ${uncachedStats.min.toFixed(2).padStart(14)} ms | ${cachedStats.min.toFixed(2).padStart(15)} ms`);
    console.log(` Max Latency         | ${uncachedStats.max.toFixed(2).padStart(14)} ms | ${cachedStats.max.toFixed(2).padStart(15)} ms`);
    console.log(` Median (P50)        | ${uncachedStats.p50.toFixed(2).padStart(14)} ms | ${cachedStats.p50.toFixed(2).padStart(15)} ms`);
    console.log(` 90th Percentile     | ${uncachedStats.p90.toFixed(2).padStart(14)} ms | ${cachedStats.p90.toFixed(2).padStart(15)} ms`);
    console.log(` 99th Percentile     | ${uncachedStats.p99.toFixed(2).padStart(14)} ms | ${cachedStats.p99.toFixed(2).padStart(15)} ms`);
    console.log(`----------------------------------------------------------------`);
    console.log(` PERFORMANCE GAIN:   Cached is ${speedup.toFixed(1)}% FASTER (${factor}x speedup)`);
    console.log(`================================================================\n`);
  } catch (err) {
    console.error('Benchmark error:', err.message);
    console.log('Ensure the server is running on port 5000 before running benchmark.');
  }
};

runBenchmark();
