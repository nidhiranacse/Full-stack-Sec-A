// Mock API. Replace with the provided fetchProducts if your exam gives one
// (keep the same return shape: { products, totalPages }).
const ALL = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Webcam'][i % 6] + ' ' + (i + 1),
  price: 10 + ((i * 7) % 90) + 0.99,
}));
const PAGE_SIZE = 6;

export function fetchProducts(query, page, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const delay = 100 + Math.random() * 700; // 100-800 ms
    const timer = setTimeout(() => {
      const q = query.trim().toLowerCase();
      const filtered = ALL.filter((p) => p.name.toLowerCase().includes(q));
      const start = (page - 1) * PAGE_SIZE;
      resolve({
        products: filtered.slice(start, start + PAGE_SIZE),
        totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
      });
    }, delay);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });
}
