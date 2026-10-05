import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const runOptimizationBenchmark = async () => {
  console.log('===============================================================');
  console.log(' CampusConnect - Database Indexing & Query Optimization Benchmark');
  console.log('===============================================================\n');

  let mongod;
  let uri = process.env.MONGO_URI;

  try {
    if (!uri) {
      console.log('[Setup] Spinning up In-Memory MongoDB Server for benchmark...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collection = db.collection('events_benchmark');

    // Clean collection
    await collection.deleteMany({});

    console.log('[Setup] Generating 6,000 realistic event records...');
    const categories = ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Cultural'];
    const venues = ['Auditorium A', 'Lab 402', 'Seminar Hall 1', 'Main Ground', 'Conference Room'];
    const docs = [];
    const baseTime = Date.now();

    for (let i = 0; i < 6000; i++) {
      const category = categories[i % categories.length];
      const offsetDays = (i % 180) - 90; // -90 to +90 days
      docs.push({
        title: `Campus Event ${i} - ${category} Masterclass`,
        description: `Detailed description for university event number ${i} with syllabus details.`,
        category,
        date: new Date(baseTime + offsetDays * 24 * 60 * 60 * 1000),
        venue: venues[i % venues.length],
        maxSeats: 50 + (i % 100),
        registeredCount: i % 40,
        createdAt: new Date()
      });
    }

    await collection.insertMany(docs);
    console.log('[Setup] 6,000 documents successfully populated.\n');

    // Query parameters: Workshop events within the next 30 days
    const query = {
      category: 'Workshop',
      date: {
        $gte: new Date(baseTime),
        $lte: new Date(baseTime + 30 * 24 * 60 * 60 * 1000)
      }
    };

    // -------------------------------------------------------------
    // PHASE 1: Query execution WITHOUT Index (COLLSCAN)
    // -------------------------------------------------------------
    console.log('>>> [PHASE 1] Executing Query WITHOUT Index (Table/Collection Scan)...');
    // Ensure no existing secondary indexes
    try {
      await collection.dropIndexes();
    } catch (e) {
      // ignore
    }

    // Run query with explain executionStats
    const beforeExplain = await collection
      .find(query)
      .sort({ date: 1 })
      .explain('executionStats');

    const beforeStats = beforeExplain.executionStats;
    const beforeStage = beforeExplain.queryPlanner.winningPlan.stage;

    console.log(`    Winning Stage:          ${beforeStage}`);
    console.log(`    Total Docs Examined:    ${beforeStats.totalDocsExamined}`);
    console.log(`    Matching Docs Returned: ${beforeStats.nReturned}`);
    console.log(`    Execution Time:         ${beforeStats.executionTimeMillis} ms\n`);

    // -------------------------------------------------------------
    // PHASE 2: Create Compound Index
    // -------------------------------------------------------------
    console.log('>>> [PHASE 2] Creating Compound Index: { category: 1, date: 1 }...');
    const indexStartTime = Date.now();
    await collection.createIndex({ category: 1, date: 1 });
    const indexDuration = Date.now() - indexStartTime;
    console.log(`    Index created in ${indexDuration} ms.\n`);

    // -------------------------------------------------------------
    // PHASE 3: Query execution WITH Compound Index (IXSCAN)
    // -------------------------------------------------------------
    console.log('>>> [PHASE 3] Executing Query WITH Compound Index (Index Scan)...');
    const afterExplain = await collection
      .find(query)
      .sort({ date: 1 })
      .explain('executionStats');

    const afterStats = afterExplain.executionStats;
    const afterPlan = afterExplain.queryPlanner.winningPlan;
    const afterStage = afterPlan.inputStage ? afterPlan.inputStage.stage : afterPlan.stage;

    console.log(`    Winning Stage:          ${afterStage}`);
    console.log(`    Total Docs Examined:    ${afterStats.totalDocsExamined}`);
    console.log(`    Matching Docs Returned: ${afterStats.nReturned}`);
    console.log(`    Execution Time:         ${afterStats.executionTimeMillis} ms\n`);

    // -------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------
    const docsReduction = (
      ((beforeStats.totalDocsExamined - afterStats.totalDocsExamined) / beforeStats.totalDocsExamined) *
      100
    ).toFixed(2);

    console.log('===============================================================');
    console.log('                   BENCHMARK RESULTS SUMMARY                   ');
    console.log('===============================================================');
    console.log('| Metric                    | Before Indexing | After Indexing |');
    console.log('|---------------------------|-----------------|----------------|');
    console.log(`| Execution Plan (Stage)    | ${beforeStage.padEnd(15)} | ${afterStage.padEnd(14)} |`);
    console.log(
      `| Total Documents Examined  | ${String(beforeStats.totalDocsExamined).padEnd(15)} | ${String(
        afterStats.totalDocsExamined
      ).padEnd(14)} |`
    );
    console.log(
      `| Documents Returned        | ${String(beforeStats.nReturned).padEnd(15)} | ${String(
        afterStats.nReturned
      ).padEnd(14)} |`
    );
    console.log(
      `| Execution Time (ms)       | ${String(beforeStats.executionTimeMillis + ' ms').padEnd(15)} | ${String(
        afterStats.executionTimeMillis + ' ms'
      ).padEnd(14)} |`
    );
    console.log(`| Docs Scan Reduction       | Baseline        | -${docsReduction}%       |`);
    console.log('===============================================================');
    console.log('Key Takeaway:');
    console.log('Adding a compound index on { category: 1, date: 1 } transformed');
    console.log('a full O(N) collection scan (inspecting all 6,000 documents) into');
    console.log(`an O(log N) B-Tree index scan (inspecting only the exact matching subset).\n`);

    await collection.drop();
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
    process.exit(0);
  } catch (err) {
    console.error('[Benchmark Error]:', err);
    if (mongod) await mongod.stop();
    process.exit(1);
  }
};

runOptimizationBenchmark();
