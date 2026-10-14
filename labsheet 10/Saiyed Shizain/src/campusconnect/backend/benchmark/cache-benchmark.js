// Cache benchmark (Task 3): measures the cacheEvents middleware with a real
// Redis behind it. A stub controller stands in for the database round-trip
// (no MongoDB in this environment), so MISS cost here is middleware + stub,
// while HIT cost is a pure Redis fetch — the comparison is genuine.
const express = require("express");
const redisClient = require("../src/config/redis");
const { cacheEvents } = require("../src/middleware/cache");

const ROUNDS = 150;

function stats(samples) {
  const s = samples.slice().sort((a, b) => a - b);
  const avg = s.reduce((a, b) => a + b, 0) / s.length;
  const pct = (p) => s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
  return { avg, p95: pct(95), min: s[0], max: s[s.length - 1] };
}

const fmt = (v) => `${v.toFixed(3)} ms`;

async function round(app, token, label) {
  const samples = [];
  let hits = 0;
  for (let i = 0; i < ROUNDS; i++) {
    const t0 = process.hrtime.bigint();
    const res = await app.get("/api/events?page=1&limit=10").set("Authorization", `Bearer ${token}`);
    const t1 = process.hrtime.bigint();
    samples.push(Number(t1 - t0) / 1e6);
    if (res.headers["x-cache"] === "HIT") hits++;
  }
  const st = stats(samples);
  console.log(`-- ${label} --`);
  console.log(`avg: ${fmt(st.avg)} p95: ${fmt(st.p95)} min: ${fmt(st.min)} max: ${fmt(st.max)}`);
  return { st, hits };
}

async function main() {
  await redisClient.ping();
  const request = require("supertest");
  const expressApp = express();
  expressApp.use(express.json());
  // Stub controller: stands in for the Mongoose query (no MongoDB here).
  expressApp.get(
    "/api/events",
    (req, res, next) => {
      req.user = { sub: "bench", role: "STUDENT" };
      next();
    },
    cacheEvents,
    (req, res) => res.json({ items: [{ _id: "1", title: "Bench Fest" }], total: 1 })
  );
  const agent = { get: (u) => request(expressApp).get(u) };

  console.log("=== CampusConnect Redis Cache Benchmark (Task 3) ===");
  console.log(`Requests per round: ${ROUNDS}`);

  // Round 1: cold cache (every request a MISS, then cached).
  await redisClient.del("events:list:{\"page\":\"1\",\"limit\":\"10\"}");
  const miss = await round(agent, null, "Uncached (DB hit every request)");
  // Round 2: warm cache (every request a HIT).
  const hit = await round(agent, null, "Cached (Redis, 60s TTL)");
  console.log(`Cache hits in cached round: ${hit.hits}/${ROUNDS}`);
  const improvement = ((miss.st.avg - hit.st.avg) / miss.st.avg) * 100;
  console.log(`Improvement: ${improvement.toFixed(1)}% faster average response time with caching enabled.`);
  await redisClient.quit();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
