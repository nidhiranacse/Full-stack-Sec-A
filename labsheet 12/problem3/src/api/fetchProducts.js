// ─── Mock fetchProducts ─────────────────────────────────────────────
// Returns a promise that resolves after a random 100–800 ms delay.
// Generates deterministic fake products based on the query string.

const PRODUCTS_PER_PAGE = 6;

const CATALOG = [
  { id: 1, name: 'Wireless Headphones', price: 79.99 },
  { id: 2, name: 'Mechanical Keyboard', price: 129.99 },
  { id: 3, name: 'Ultrawide Monitor', price: 449.99 },
  { id: 4, name: 'USB-C Hub', price: 49.99 },
  { id: 5, name: 'Webcam HD Pro', price: 89.99 },
  { id: 6, name: 'Standing Desk Mat', price: 34.99 },
  { id: 7, name: 'Noise Cancelling Earbuds', price: 149.99 },
  { id: 8, name: 'Ergonomic Mouse', price: 69.99 },
  { id: 9, name: 'Laptop Stand Aluminum', price: 54.99 },
  { id: 10, name: 'Portable SSD 1TB', price: 109.99 },
  { id: 11, name: 'Smart LED Desk Lamp', price: 39.99 },
  { id: 12, name: 'Blue-Light Glasses', price: 24.99 },
  { id: 13, name: 'Cable Management Kit', price: 19.99 },
  { id: 14, name: 'Wireless Charger Pad', price: 29.99 },
  { id: 15, name: 'Desk Organizer Wood', price: 44.99 },
  { id: 16, name: 'Portable Speaker Mini', price: 59.99 },
  { id: 17, name: 'Drawing Tablet', price: 199.99 },
  { id: 18, name: 'USB Microphone Studio', price: 119.99 },
  { id: 19, name: 'Monitor Light Bar', price: 64.99 },
  { id: 20, name: 'Mechanical Numpad', price: 45.99 },
];

export default function fetchProducts(query, page = 1, signal) {
  const delay = Math.floor(Math.random() * 700) + 100;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = (query || '').toLowerCase().trim();
      const filtered = q
        ? CATALOG.filter((p) => p.name.toLowerCase().includes(q))
        : [...CATALOG];

      const total = filtered.length;
      const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE) || 1;
      const start = (page - 1) * PRODUCTS_PER_PAGE;
      const data = filtered.slice(start, start + PRODUCTS_PER_PAGE);

      resolve({ data, page, totalPages, total });
    }, delay);

    // Support AbortController
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });
}
