/**
 * Query Indexing Optimization Benchmark Route
 * Lab Sheet 11 - Bonus Challenge:
 * "Optimize one slow query using indexing and show before/after execution time"
 */

const express = require('express');
const router = express.Router();
const { DatabaseSync } = require('node:sqlite');

/**
 * @route   GET /api/benchmark/indexing
 * @desc    Simulate and benchmark 10,000 records query before and after B-Tree indexing
 * @access  Public
 */
router.get('/indexing', (req, res) => {
  try {
    const memDb = new DatabaseSync(':memory:');

    // 1. Create unindexed table
    memDb.exec(`
      CREATE TABLE benchmark_events (
        id INTEGER PRIMARY KEY,
        title TEXT,
        category TEXT,
        date TEXT,
        maxSeats INTEGER,
        venue TEXT
      );
    `);

    // 2. Populate 10,000 realistic records
    const categories = ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar'];
    const venues = ['Hall A', 'Lab 1', 'Lab 2', 'Auditorium', 'Seminar Room'];

    const insertStmt = memDb.prepare(`
      INSERT INTO benchmark_events (id, title, category, date, maxSeats, venue)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    memDb.exec('BEGIN TRANSACTION;');
    for (let i = 1; i <= 10000; i++) {
      const cat = categories[i % categories.length];
      const month = String((i % 12) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      const date = `2026-${month}-${day}`;
      const venue = venues[i % venues.length];
      insertStmt.run(i, `Campus Event #${i}`, cat, date, 50 + (i % 100), venue);
    }
    memDb.exec('COMMIT;');

    const testQuery = "SELECT * FROM benchmark_events WHERE category = 'Hackathon' AND date >= '2026-06-01' ORDER BY maxSeats DESC LIMIT 50";

    // 3. Query Plan BEFORE Index
    const explainBefore = memDb.prepare(`EXPLAIN QUERY PLAN ${testQuery}`).all();

    // 4. Measure execution time BEFORE Index (average of 10 warm runs)
    const runs = 15;
    let startBefore = process.hrtime.bigint();
    for (let i = 0; i < runs; i++) {
      memDb.prepare(testQuery).all();
    }
    let endBefore = process.hrtime.bigint();
    const durationBeforeMs = Number(endBefore - startBefore) / (1e6 * runs);

    // 5. Create B-Tree Composite Index
    let startIdx = process.hrtime.bigint();
    memDb.exec('CREATE INDEX idx_benchmark_cat_date ON benchmark_events(category, date);');
    let endIdx = process.hrtime.bigint();
    const indexCreationTimeMs = Number(endIdx - startIdx) / 1e6;

    // 6. Query Plan AFTER Index
    const explainAfter = memDb.prepare(`EXPLAIN QUERY PLAN ${testQuery}`).all();

    // 7. Measure execution time AFTER Index (average of 10 runs)
    let startAfter = process.hrtime.bigint();
    for (let i = 0; i < runs; i++) {
      memDb.prepare(testQuery).all();
    }
    let endAfter = process.hrtime.bigint();
    const durationAfterMs = Number(endAfter - startAfter) / (1e6 * runs);

    const speedup = (durationBeforeMs / Math.max(0.01, durationAfterMs)).toFixed(2);

    return res.status(200).json({
      success: true,
      challenge: 'Bonus Challenge: Query Optimization using Database Indexing',
      datasetSize: '10,000 records',
      targetQuery: testQuery,
      benchmark: {
        beforeIndexing: {
          executionTimeMs: Number(durationBeforeMs.toFixed(3)),
          queryPlan: explainBefore.map(row => row.detail).join(' -> ') || 'SCAN TABLE benchmark_events',
          scanStrategy: 'Full Table Scan (Sequential scan of all 10,000 rows)'
        },
        indexCreation: {
          statement: 'CREATE INDEX idx_benchmark_cat_date ON benchmark_events(category, date);',
          creationTimeMs: Number(indexCreationTimeMs.toFixed(3))
        },
        afterIndexing: {
          executionTimeMs: Number(durationAfterMs.toFixed(3)),
          queryPlan: explainAfter.map(row => row.detail).join(' -> ') || 'SEARCH TABLE benchmark_events USING INDEX idx_benchmark_cat_date',
          scanStrategy: 'B-Tree Index Seek (Direct key range traversal O(log N))'
        },
        speedupMultiplier: `${speedup}x Faster`,
        conclusion: `Indexed query executed in ${durationAfterMs.toFixed(3)} ms vs ${durationBeforeMs.toFixed(3)} ms unindexed (${speedup}x speedup).`
      }
    });
  } catch (err) {
    console.error('Benchmark error:', err);
    return res.status(500).json({ success: false, message: 'Benchmark execution failed', error: err.message });
  }
});

module.exports = router;
