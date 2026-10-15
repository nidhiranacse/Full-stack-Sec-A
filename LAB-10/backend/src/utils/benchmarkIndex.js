/**
 * CampusConnect Database Performance Benchmark
 * Bonus Challenge: "Optimize one slow query using indexing and show before/after execution time"
 *
 * This benchmark compares query execution times with and without a composite B-Tree index
 * over a dataset of 100,000 event records.
 */

const Database = require('better-sqlite3');
const { performance } = require('perf_hooks');

function runBenchmark() {
  console.log('===============================================================');
  console.log(' CAMPUSCONNECT DATABASE INDEXING PERFORMANCE BENCHMARK');
  console.log('===============================================================');

  // Use an in-memory database to isolate pure query planning & disk-page traversal
  const db = new Database(':memory:');
  db.pragma('journal_mode = OFF');
  db.pragma('synchronous = OFF');

  console.log('\n[1/4] Creating benchmark table: events_benchmark...');
  db.exec(`
    CREATE TABLE events_benchmark (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      total_seats INTEGER NOT NULL
    );
  `);

  console.log('[2/4] Populating 100,000 event records for query stress testing...');
  const categories = ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Tech Fest'];
  const insertStmt = db.prepare(`
    INSERT INTO events_benchmark (title, description, category, date, time, venue, total_seats)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    for (const r of rows) insertStmt.run(...r);
  });

  const sampleRows = [];
  for (let i = 1; i <= 100000; i++) {
    const cat = categories[i % categories.length];
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');
    sampleRows.push([
      `Campus Event #${i}`,
      `Comprehensive description for technical campus event #${i} covering hands-on labs.`,
      cat,
      `2026-${month}-${day}`,
      '10:00 AM',
      `Hall ${(i % 10) + 1}`,
      (i % 150) + 30
    ]);
  }
  insertMany(sampleRows);
  console.log('✓ Successfully inserted 100,000 records.');

  const targetCategory = 'Workshop';
  const targetDate = '2026-06-15';
  const query = `
    SELECT id, title, category, date, venue, total_seats
    FROM events_benchmark
    WHERE category = ? AND date >= ?
    ORDER BY date ASC
    LIMIT 20
  `;

  // --- BENCHMARK WITHOUT INDEX (Full Table Scan) ---
  console.log('\n[3/4] Benchmarking query WITHOUT Index (Full Table Scan)...');
  const explainNoIndex = db.prepare(`EXPLAIN QUERY PLAN ${query}`).all(targetCategory, targetDate);
  console.log('Query Execution Plan:');
  explainNoIndex.forEach(plan => console.log(`  -> ${plan.detail}`));

  // Run 10 iterations to compute average execution time
  const iterations = 10;
  const timesWithoutIndex = [];
  const stmtNoIndex = db.prepare(query);

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    stmtNoIndex.all(targetCategory, targetDate);
    const end = performance.now();
    timesWithoutIndex.push(end - start);
  }
  const avgWithoutIndex = (timesWithoutIndex.reduce((a, b) => a + b, 0) / iterations).toFixed(3);
  console.log(`Average Execution Time (WITHOUT Index): ${avgWithoutIndex} ms`);

  // --- CREATE COMPOSITE INDEX ---
  console.log('\n[4/4] Creating Composite B-Tree Index: idx_events_cat_date ON (category, date)...');
  const indexCreateStart = performance.now();
  db.exec('CREATE INDEX idx_events_cat_date ON events_benchmark(category, date);');
  const indexCreateTime = (performance.now() - indexCreateStart).toFixed(2);
  console.log(`✓ Index created in ${indexCreateTime} ms.`);

  // --- BENCHMARK WITH COMPOSITE INDEX (Index Scan) ---
  const explainWithIndex = db.prepare(`EXPLAIN QUERY PLAN ${query}`).all(targetCategory, targetDate);
  console.log('\nOptimized Query Execution Plan:');
  explainWithIndex.forEach(plan => console.log(`  -> ${plan.detail}`));

  const timesWithIndex = [];
  const stmtWithIndex = db.prepare(query);

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    stmtWithIndex.all(targetCategory, targetDate);
    const end = performance.now();
    timesWithIndex.push(end - start);
  }
  const avgWithIndex = (timesWithIndex.reduce((a, b) => a + b, 0) / iterations).toFixed(3);
  console.log(`Average Execution Time (WITH Index): ${avgWithIndex} ms`);

  const speedup = (avgWithoutIndex / Math.max(0.001, avgWithIndex)).toFixed(1);

  console.log('\n===============================================================');
  console.log(' BENCHMARK RESULTS SUMMARY');
  console.log('===============================================================');
  console.log(` Dataset Size              : 100,000 Records`);
  console.log(` Tested Query              : Filter by category='${targetCategory}' and date>='${targetDate}'`);
  console.log(` Execution Plan (Before)   : SCAN TABLE events_benchmark (Full table scan)`);
  console.log(` Execution Time (Before)   : ${avgWithoutIndex} ms`);
  console.log(` Execution Plan (After)    : SEARCH TABLE USING INDEX idx_events_cat_date`);
  console.log(` Execution Time (After)    : ${avgWithIndex} ms`);
  console.log(` Performance Improvement   : ~${speedup}x FASTER!`);
  console.log('===============================================================\n');

  db.close();
  return {
    records: 100000,
    beforeMs: avgWithoutIndex,
    afterMs: avgWithIndex,
    speedup: `${speedup}x`
  };
}

if (require.main === module) {
  runBenchmark();
}

module.exports = runBenchmark;
