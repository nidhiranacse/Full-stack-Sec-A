import urllib.request
import time
import json
import statistics

BASE_URL = "http://localhost:5000/api/events"
NUM_REQUESTS = 100

def test_request(url):
    start = time.perf_counter()
    req = urllib.request.Request(url, headers={"User-Agent": "BenchmarkClient/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read()
            end = time.perf_counter()
            duration_ms = (end - start) * 1000.0
            x_cache = response.headers.get("X-Cache", "UNKNOWN")
            return response.status, duration_ms, x_cache
    except Exception as e:
        print(f"Request failed: {e}")
        return None, 0, "ERROR"

def print_stats(name, times):
    avg = statistics.mean(times)
    min_t = min(times)
    max_t = max(times)
    median = statistics.median(times)
    p90 = sorted(times)[int(len(times) * 0.9)]
    p99 = sorted(times)[int(len(times) * 0.99)]
    return avg, min_t, max_t, median, p90, p99

def run_benchmark():
    print("=" * 64)
    print("  CampusConnect - Python Benchmark (Task 3: Redis vs Uncached)")
    print(f"  Target: {BASE_URL}")
    print(f"  Sample size: {NUM_REQUESTS} requests per scenario")
    print("=" * 64 + "\n")

    # 1. Warm-up
    print("1. Warming up cache...")
    status, dur, cache = test_request(BASE_URL)
    if status is None:
        print("Error: Could not connect to API server. Ensure backend is running.")
        return
    print(f"   Warm-up status: {status} ({cache}) in {dur:.2f}ms\n")

    # 2. Cached
    print(f"2. Running {NUM_REQUESTS} CACHED requests (Cache HIT)...")
    cached_times = []
    for i in range(NUM_REQUESTS):
        s, dur, c = test_request(BASE_URL)
        cached_times.append(dur)
    print(f"   -> Completed {NUM_REQUESTS} cached requests.\n")

    # 3. Uncached
    print(f"3. Running {NUM_REQUESTS} UNCACHED requests (Cache MISS / DB Query)...")
    uncached_times = []
    for i in range(NUM_REQUESTS):
        unique_url = f"{BASE_URL}?search=bench_py_{int(time.time()*1000)}_{i}"
        s, dur, c = test_request(unique_url)
        uncached_times.append(dur)
    print(f"   -> Completed {NUM_REQUESTS} uncached requests.\n")

    # Report
    c_avg, c_min, c_max, c_p50, c_p90, c_p99 = print_stats("Cached", cached_times)
    u_avg, u_min, u_max, u_p50, u_p90, u_p99 = print_stats("Uncached", uncached_times)

    speedup = ((u_avg - c_avg) / u_avg) * 100
    factor = u_avg / c_avg if c_avg > 0 else 1.0

    print("=" * 64)
    print("                     BENCHMARK RESULTS REPORT")
    print("=" * 64)
    print(" Metric              | Uncached (MongoDB) | Cached (Redis/Cache)")
    print("-" * 64)
    print(f" Average (Mean) Time | {u_avg:14.2f} ms | {c_avg:15.2f} ms")
    print(f" Min Latency         | {u_min:14.2f} ms | {c_min:15.2f} ms")
    print(f" Max Latency         | {u_max:14.2f} ms | {c_max:15.2f} ms")
    print(f" Median (P50)        | {u_p50:14.2f} ms | {c_p50:15.2f} ms")
    print(f" 90th Percentile     | {u_p90:14.2f} ms | {c_p90:15.2f} ms")
    print(f" 99th Percentile     | {u_p99:14.2f} ms | {c_p99:15.2f} ms")
    print("-" * 64)
    print(f" PERFORMANCE GAIN:   Cached is {speedup:.1f}% FASTER ({factor:.2f}x speedup)")
    print("=" * 64 + "\n")

if __name__ == "__main__":
    run_benchmark()
