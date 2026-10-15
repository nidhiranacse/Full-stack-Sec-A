// Author: Radha Pandey, CSE - CampusConnect
// Bonus: before/after indexing demo (SQLite). Run: npm run benchmark
const { Sequelize } = require('sequelize');
const os = require('os');
const path = require('path');
const fs = require('fs');

const file = path.join(os.tmpdir(), 'campusconnect-bench.sqlite');
if (fs.existsSync(file)) fs.unlinkSync(file);
const db = new Sequelize({ dialect: 'sqlite', storage: file, logging: false });

const SQL = `SELECT id, title, date FROM bench_events
             WHERE category = 'hackathon' AND date >= '2026-06-01'
             ORDER BY date ASC LIMIT 10`;

async function time(label) {
  await db.query(SQL); // warm up
  const runs = 30;
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < runs; i++) await db.query(SQL);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / runs;
  const [plan] = await db.query('EXPLAIN QUERY PLAN ' + SQL);
  console.log(`${label}: ${ms.toFixed(2)} ms/query | plan: ${plan.map((p) => p.detail).join(' ; ')}`);
  return ms;
}

(async () => {
  await db.query('CREATE TABLE bench_events (id INTEGER PRIMARY KEY, title TEXT, category TEXT, date TEXT)');
  const cats = ['workshop', 'hackathon', 'placement', 'seminar'];
  const N = 100000;
  for (let start = 0; start < N; start += 500) {
    const rows = [];
    const repl = [];
    for (let i = start; i < start + 500; i++) {
      rows.push('(?,?,?)');
      const d = new Date(Date.UTC(2025, 0, 1) + (i % 800) * 86400000 + (i % 1440) * 60000);
      repl.push(`Event ${i}`, cats[i % 4], d.toISOString());
    }
    await db.query(`INSERT INTO bench_events (title, category, date) VALUES ${rows.join(',')}`, { replacements: repl });
  }
  console.log(`Seeded ${N} rows`);
  const before = await time('BEFORE index');
  await db.query('CREATE INDEX idx_bench_category_date ON bench_events (category, date)');
  const after = await time('AFTER  index');
  console.log(`Speed-up: ~${(before / after).toFixed(1)}x`);
  await db.close();
  fs.unlinkSync(file);
})();
