const { performance } = require('perf_hooks');

async function runBenchmark() {
  const totalRequests = 1000;

  console.log('Cache Benchmark');
  console.log('----------------');

  const start = performance.now();

  for (let i = 0; i < totalRequests; i++) {
    await Promise.resolve();
  }

  const end = performance.now();

  console.log(`Requests: ${totalRequests}`);
  console.log(`Time: ${(end - start).toFixed(2)} ms`);
  console.log(
    `Average: ${((end - start) / totalRequests).toFixed(4)} ms/request`
  );
}

runBenchmark().catch((error) => {
  console.error('Benchmark failed:', error.message);
});