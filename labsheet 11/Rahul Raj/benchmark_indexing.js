/**
 * CampusConnect Database Indexing Benchmark
 * Lab Sheet 11 - Bonus Challenge:
 * "Optimize one slow query using indexing and show before/after execution time"
 * Student: Rahul Raj (cu24250116)
 */

const { DatabaseSync } = require('node:sqlite');

console.log('========================================================================');
console.log('⚡ DATABASE QUERY INDEXING BENCHMARK - LAB SHEET 11 BONUS CHALLENGE');
console.log('========================================================================\n');

// 1. Initialize SQLite Database in memory
const db = new DatabaseSync(':memory:');

console.log('1. Setting up table `benchmark_events` with 10,000 synthetic event records...');
db.exec(`
  CREATE TABLE benchmark_events (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    maxSeats INTEGER NOT NULL,
    venue TEXT NOT NULL,
    description TEXT
  );
`);

const categories = ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar'];
const venues = ['Hall A', 'Lab 1', 'Lab 2', 'Auditorium', 'Seminar Room'];

const insertStmt = db.prepare(`
  INSERT INTO benchmark_events (id, title, category, date, maxSeats, venue, description)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');
for (let i = 1; i <= 10000; i++) {
  const cat = categories[i % categories.length];
  const month = String((i % 12) + 1).padStart(2, '0');
  const day = String((i % 28) + 1).padStart(2, '0');
  const date = `2026-${month}-${day}`;
  const venue = venues[i % venues.length];
  insertStmt.run(i, `Campus Event #${i}`, cat, date, 50 + (i % 100), venue, `Description for event #${i}`);
}
db.exec('COMMIT;');
console.log('✔ Successfully populated 10,000 records.\n');

const testQuery = "SELECT * FROM benchmark_events WHERE category = 'Hackathon' AND date >= '2026-06-01' ORDER BY maxSeats DESC LIMIT 50;";
console.log(`2. Target Query to Benchmark:`);
console.log(`   ${testQuery}\n`);

// Measure unindexed execution time
console.log('3. Running Query WITHOUT Index (Full Table Scan):');
const explainBefore = db.prepare(`EXPLAIN QUERY PLAN ${testQuery}`).all();
console.log('   Query Plan:', explainBefore.map(r => r.detail).join(' -> ') || 'SCAN TABLE benchmark_events');

const WARMUP_RUNS = 5;
const BENCHMARK_RUNS = 25;

// Warmup
for (let i = 0; i < WARMUP_RUNS; i++) db.prepare(testQuery).all();

let t0 = process.hrtime.bigint();
for (let i = 0; i < BENCHMARK_RUNS; i++) {
  db.prepare(testQuery).all();
}
let t1 = process.hrtime.bigint();
const timeBeforeMs = Number(t1 - t0) / (1e6 * BENCHMARK_RUNS);
console.log(`   Average Execution Time (Unindexed): \x1b[31m${timeBeforeMs.toFixed(3)} ms\x1b[0m\n`);

// 4. Create Composite Index
console.log('4. Creating Composite B-Tree Index:');
console.log("   SQL: CREATE INDEX idx_events_cat_date ON benchmark_events(category, date);");
let tIdx0 = process.hrtime.bigint();
db.exec('CREATE INDEX idx_events_cat_date ON benchmark_events(category, date);');
let tIdx1 = process.hrtime.bigint();
const indexTimeMs = Number(tIdx1 - tIdx0) / 1e6;
console.log(`   Index Build Time: ${indexTimeMs.toFixed(2)} ms\n`);

// 5. Measure indexed execution time
console.log('5. Running Query WITH Index (B-Tree Seek & Range Scan):');
const explainAfter = db.prepare(`EXPLAIN QUERY PLAN ${testQuery}`).all();
console.log('   Query Plan:', explainAfter.map(r => r.detail).join(' -> ') || 'SEARCH TABLE benchmark_events USING INDEX idx_events_cat_date');

// Warmup
for (let i = 0; i < WARMUP_RUNS; i++) db.prepare(testQuery).all();

let t2 = process.hrtime.bigint();
for (let i = 0; i < BENCHMARK_RUNS; i++) {
  db.prepare(testQuery).all();
}
let t3 = process.hrtime.bigint();
const timeAfterMs = Number(t3 - t2) / (1e6 * BENCHMARK_RUNS);
console.log(`   Average Execution Time (Indexed):   \x1b[32m${timeAfterMs.toFixed(3)} ms\x1b[0m\n`);

// 6. Summary Comparison
const speedup = (timeBeforeMs / Math.max(0.001, timeAfterMs)).toFixed(2);
console.log('========================================================================');
console.log('📊 BENCHMARK PERFORMANCE RESULTS');
console.log('========================================================================');
console.log(`  Records in Dataset:       10,000 rows`);
console.log(`  Before Index (Scan):      ${timeBeforeMs.toFixed(3)} ms`);
console.log(`  After Index (B-Tree Seek): ${timeAfterMs.toFixed(3)} ms`);
console.log(`  Performance Gain:         \x1b[32m\x1b[1m${speedup}x FASTER (${Math.round((1 - timeAfterMs / timeBeforeMs) * 100)}% latency reduction)\x1b[0m`);
console.log('========================================================================\n');
