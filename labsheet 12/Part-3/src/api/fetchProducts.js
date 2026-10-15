/* ──────────────────────────────────────────────────────────
   fetchProducts(query, page, { signal })
   Simulates a paginated product search API.
   – Returns { products: [...], hasMore: boolean }
   – Supports AbortController via options.signal
   ────────────────────────────────────────────────────────── */

const CATALOGUE = [
  { id: 1,  name: "Wireless Headphones",      price: 79.99,  category: "Electronics",  image: "🎧" },
  { id: 2,  name: "Bluetooth Speaker",         price: 49.99,  category: "Electronics",  image: "🔊" },
  { id: 3,  name: "Mechanical Keyboard",       price: 129.99, category: "Electronics",  image: "⌨️" },
  { id: 4,  name: "USB-C Hub",                 price: 39.99,  category: "Electronics",  image: "🔌" },
  { id: 5,  name: "Noise Cancelling Earbuds",  price: 149.99, category: "Electronics",  image: "🎵" },
  { id: 6,  name: "Running Shoes",             price: 89.99,  category: "Sports",       image: "👟" },
  { id: 7,  name: "Yoga Mat",                  price: 29.99,  category: "Sports",       image: "🧘" },
  { id: 8,  name: "Water Bottle",              price: 14.99,  category: "Sports",       image: "💧" },
  { id: 9,  name: "Fitness Tracker",           price: 59.99,  category: "Sports",       image: "⌚" },
  { id: 10, name: "Resistance Bands",          price: 19.99,  category: "Sports",       image: "💪" },
  { id: 11, name: "Desk Lamp",                 price: 34.99,  category: "Home",         image: "💡" },
  { id: 12, name: "Coffee Maker",              price: 69.99,  category: "Home",         image: "☕" },
  { id: 13, name: "Air Purifier",              price: 149.99, category: "Home",         image: "🌬️" },
  { id: 14, name: "Smart Thermostat",          price: 199.99, category: "Home",         image: "🌡️" },
  { id: 15, name: "Scented Candle Set",        price: 24.99,  category: "Home",         image: "🕯️" },
  { id: 16, name: "Backpack",                  price: 54.99,  category: "Accessories",  image: "🎒" },
  { id: 17, name: "Sunglasses",                price: 39.99,  category: "Accessories",  image: "🕶️" },
  { id: 18, name: "Leather Wallet",            price: 44.99,  category: "Accessories",  image: "👛" },
  { id: 19, name: "Watch",                     price: 109.99, category: "Accessories",  image: "⏱️" },
  { id: 20, name: "Baseball Cap",              price: 19.99,  category: "Accessories",  image: "🧢" },
  { id: 21, name: "Wireless Mouse",            price: 29.99,  category: "Electronics",  image: "🖱️" },
  { id: 22, name: "Webcam HD",                 price: 64.99,  category: "Electronics",  image: "📷" },
  { id: 23, name: "Standing Desk Mat",         price: 44.99,  category: "Home",         image: "🏠" },
  { id: 24, name: "Plant Pot Set",             price: 22.99,  category: "Home",         image: "🪴" },
  { id: 25, name: "Dumbbells (Pair)",          price: 34.99,  category: "Sports",       image: "🏋️" },
];

const PAGE_SIZE = 6;

export async function fetchProducts(query = "", page = 1, options = {}) {
  // Simulate network latency (200-600 ms)
  const delay = 200 + Math.random() * 400;

  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, delay);

    // Support AbortController
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });

  const q = query.toLowerCase().trim();
  const filtered = q
    ? CATALOGUE.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : CATALOGUE;

  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  return {
    products: paged,
    hasMore: start + PAGE_SIZE < filtered.length,
    total: filtered.length,
  };
}
