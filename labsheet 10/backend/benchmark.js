/**
 * CampusConnect - Redis Caching Benchmark Runner (Task 3)
 * Measures average response time for cached vs. uncached requests (minimum 100 requests each).
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function runBenchmark() {
  console.log('===============================================================');
  console.log('  CampusConnect: Redis Cache Performance Benchmark (Task 3)    ');
  console.log('===============================================================\n');

  try {
    // Step 1: Healthcheck
    console.log(`[1/4] Checking server status at ${BASE_URL}...`);
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (!healthRes.ok) {
      throw new Error(`Server returned ${healthRes.status}: ${await healthRes.text()}`);
    }
    console.log('✓ Server is active.\n');

    // Step 2: Login / Register student to get auth token
    console.log('[2/4] Authenticating student benchmark user...');
    const testEmail = `bench_${Date.now()}@campusconnect.edu`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Benchmark Student',
        email: testEmail,
        password: 'Password123!',
        role: 'STUDENT'
      })
    });

    const regData = await regRes.json();
    if (!regData.success) {
      throw new Error(`Failed to create benchmark user: ${regData.message}`);
    }
    const token = regData.accessToken;
    console.log('✓ Authentication successful. Bearer token acquired.\n');

    // Helper to measure single request latency
    async function measureRequest(url, bypassCache = false) {
      const targetUrl = bypassCache ? `${url}?_nocache=${Date.now()}_${Math.random()}` : url;
      const start = performance.now();
      const res = await fetch(targetUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const end = performance.now();
      await res.json();
      const cacheHeader = res.headers.get('x-cache') || 'UNKNOWN';
      return { latency: end - start, cache: cacheHeader };
    }

    const REQUEST_COUNT = 100;

    // Step 3: Run Uncached benchmark (100 requests with unique query params to bypass or fresh queries)
    console.log(`[3/4] Running UNCACHED benchmark (${REQUEST_COUNT} requests)...`);
    const uncachedLatencies = [];
    for (let i = 0; i < REQUEST_COUNT; i++) {
      const { latency } = await measureRequest(`${BASE_URL}/api/events`, true);
      uncachedLatencies.push(latency);
      if ((i + 1) % 25 === 0) process.stdout.write(`  Progress: ${i + 1}/${REQUEST_COUNT}\r`);
    }
    console.log(`\n✓ Completed ${REQUEST_COUNT} uncached requests.\n`);

    // Warm up cache for GET /api/events
    await measureRequest(`${BASE_URL}/api/events`, false);

    // Step 4: Run Cached benchmark (100 requests hit the warm Redis cache)
    console.log(`[4/4] Running CACHED benchmark (${REQUEST_COUNT} requests)...`);
    const cachedLatencies = [];
    let hitCount = 0;
    for (let i = 0; i < REQUEST_COUNT; i++) {
      const { latency, cache } = await measureRequest(`${BASE_URL}/api/events`, false);
      cachedLatencies.push(latency);
      if (cache === 'HIT') hitCount++;
      if ((i + 1) % 25 === 0) process.stdout.write(`  Progress: ${i + 1}/${REQUEST_COUNT}\r`);
    }
    console.log(`\n✓ Completed ${REQUEST_COUNT} cached requests (Cache Hits: ${hitCount}/${REQUEST_COUNT}).\n`);

    // Helper for statistics
    function calcStats(latencies) {
      const sorted = [...latencies].sort((a, b) => a - b);
      const sum = sorted.reduce((acc, v) => acc + v, 0);
      const avg = sum / sorted.length;
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      return { avg, min, max, p95, p99 };
    }

    const uncachedStats = calcStats(uncachedLatencies);
    const cachedStats = calcStats(cachedLatencies);
    const speedup = uncachedStats.avg / (cachedStats.avg || 1);
    const improvementPercent = Math.max(0, ((uncachedStats.avg - cachedStats.avg) / uncachedStats.avg) * 100);

    console.log('===============================================================');
    console.log('                   BENCHMARK RESULTS SUMMARY                   ');
    console.log('===============================================================');
    console.log(`Metric                   | Uncached (Direct DB) | Cached (Redis)   `);
    console.log(`-------------------------|----------------------|------------------`);
    console.log(`Requests Sampled         | ${REQUEST_COUNT.toString().padEnd(20)} | ${REQUEST_COUNT.toString().padEnd(16)} `);
    console.log(`Average Latency          | ${uncachedStats.avg.toFixed(2).padEnd(17)} ms | ${cachedStats.avg.toFixed(2).padEnd(13)} ms `);
    console.log(`Min Latency              | ${uncachedStats.min.toFixed(2).padEnd(17)} ms | ${cachedStats.min.toFixed(2).padEnd(13)} ms `);
    console.log(`Max Latency              | ${uncachedStats.max.toFixed(2).padEnd(17)} ms | ${cachedStats.max.toFixed(2).padEnd(13)} ms `);
    console.log(`95th Percentile (p95)    | ${uncachedStats.p95.toFixed(2).padEnd(17)} ms | ${cachedStats.p95.toFixed(2).padEnd(13)} ms `);
    console.log(`99th Percentile (p99)    | ${uncachedStats.p99.toFixed(2).padEnd(17)} ms | ${cachedStats.p99.toFixed(2).padEnd(13)} ms `);
    console.log(`---------------------------------------------------------------`);
    console.log(`Performance Speedup:     ${speedup.toFixed(2)}x faster`);
    console.log(`Latency Reduction:       ${improvementPercent.toFixed(1)}% reduction in response time`);
    console.log('===============================================================\n');

  } catch (error) {
    console.error('Benchmark Error:', error.message);
    console.log('\nMake sure backend server is running (npm run dev or docker compose up) before running benchmark.');
  }
}

runBenchmark();
