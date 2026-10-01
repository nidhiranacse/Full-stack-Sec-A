// Benchmark GET /api/events : Redis-cached server (:5001) vs uncached server (:5002)
// usage: node bench.js   (both servers must already be running against the same DB)
const autocannon = require('autocannon');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({ id: '000000000000000000000001', role: 'STUDENT', name: 'bench' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

const run = (url, title) => new Promise((resolve) => {
  autocannon({ url, connections: 10, amount: 500, headers: { Authorization: `Bearer ${token}` }, title }, (err, r) => resolve(r));
});
(async () => {
  const path = '/api/events?page=1&limit=6';
  const uncached = await run('http://127.0.0.1:5002' + path, 'uncached');
  const cached = await run('http://127.0.0.1:5001' + path, 'cached');
  const row = (n, r) => `${n.padEnd(22)}${String(r.requests.total).padEnd(10)}${r.latency.average.toFixed(2).padEnd(14)}${r.latency.p99.toFixed(0).padEnd(10)}${String(Math.round(r.requests.average)).padEnd(12)}${r.non2xx}`;
  console.log('Scenario              Requests  Avg lat (ms)  p99 (ms)  Req/sec     non-2xx');
  console.log('-'.repeat(78));
  console.log(row('Without Redis (DB)', uncached));
  console.log(row('With Redis cache', cached));
  console.log('-'.repeat(78));
  console.log(`Avg latency improvement: ${(uncached.latency.average / cached.latency.average).toFixed(1)}x faster  (${(100 * (1 - cached.latency.average / uncached.latency.average)).toFixed(1)}% reduction)`);
  console.log(`Throughput improvement : ${(cached.requests.average / uncached.requests.average).toFixed(1)}x`);
})();
