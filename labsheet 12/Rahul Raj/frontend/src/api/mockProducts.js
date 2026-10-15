/**
 * Mock Product API
 * BTCS303T Full Stack | Coding Assessment - Problem 3
 * 
 * Requirement:
 * fetchProducts(query, page) returns a promise that resolves after a random delay of 100 to 800 ms.
 * Supports AbortController signal to handle cancellation of stale requests.
 */

export const MOCK_DATABASE = [
  {
    id: 1,
    name: 'MacBook Pro M3 16"',
    category: 'Laptops',
    price: 2499.00,
    rating: 4.9,
    stock: 12,
    image: '💻',
    description: 'Apple M3 Pro chip, 36GB unified memory, 512GB SSD storage.'
  },
  {
    id: 2,
    name: 'Dell XPS 15 OLED',
    category: 'Laptops',
    price: 1899.00,
    rating: 4.7,
    stock: 8,
    image: '💻',
    description: '13th Gen Intel Core i7, 3.5K OLED touch display, 16GB RAM.'
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5',
    category: 'Audio',
    price: 399.00,
    rating: 4.8,
    stock: 25,
    image: '🎧',
    description: 'Industry-leading noise canceling with Auto NC Optimizer and 30hr battery.'
  },
  {
    id: 4,
    name: 'Keychron Q1 Pro Wireless',
    category: 'Peripherals',
    price: 199.00,
    rating: 4.9,
    stock: 15,
    image: '⌨️',
    description: 'QMK/VIA wireless custom mechanical keyboard with CNC aluminum body.'
  },
  {
    id: 5,
    name: 'Logitech MX Master 3S',
    category: 'Peripherals',
    price: 99.00,
    rating: 4.8,
    stock: 40,
    image: '🖱️',
    description: 'Quiet clicks and 8K DPI track-on-glass sensor ergonomic mouse.'
  },
  {
    id: 6,
    name: 'LG UltraFine 27" 4K Ergo',
    category: 'Monitors',
    price: 549.00,
    rating: 4.6,
    stock: 10,
    image: '🖥️',
    description: 'IPS UHD display with innovative ergonomic arm and USB-C 60W power delivery.'
  },
  {
    id: 7,
    name: 'iPad Pro 11" M4',
    category: 'Tablets',
    price: 999.00,
    rating: 4.9,
    stock: 18,
    image: '📱',
    description: 'Ultra Retina XDR display, breakthrough performance, all-day battery.'
  },
  {
    id: 8,
    name: 'Samsung 990 PRO 2TB SSD',
    category: 'Storage',
    price: 179.00,
    rating: 4.9,
    stock: 30,
    image: '💾',
    description: 'PCIe 4.0 NVMe M.2 internal gaming SSD with sequential reads up to 7450 MB/s.'
  },
  {
    id: 9,
    name: 'Shure MV7+ Podcast Mic',
    category: 'Audio',
    price: 279.00,
    rating: 4.7,
    stock: 14,
    image: '🎙️',
    description: 'Dynamic microphone with hybrid USB-C and XLR outputs, DSP effects.'
  },
  {
    id: 10,
    name: 'Bose QuietComfort Ultra',
    category: 'Audio',
    price: 429.00,
    rating: 4.6,
    stock: 20,
    image: '🎧',
    description: 'Spatial audio with world-class active noise cancellation and custom modes.'
  },
  {
    id: 11,
    name: 'Herman Miller Aeron Chair',
    category: 'Furniture',
    price: 1295.00,
    rating: 4.9,
    stock: 6,
    image: '🪑',
    description: 'Benchmark ergonomic work chair with PostureFit SL and 8Z Pellicle suspension.'
  },
  {
    id: 12,
    name: 'CalDigit TS4 Thunderbolt 4 Dock',
    category: 'Accessories',
    price: 399.00,
    rating: 4.8,
    stock: 12,
    image: '🔌',
    description: '18 ports of extreme connectivity with 98W charging for Mac & PC.'
  }
];

const ITEMS_PER_PAGE = 4;

/**
 * Fetch products with random delay (100ms - 800ms) and AbortController signal support
 * @param {string} query - search query
 * @param {number} page - page number (1-indexed)
 * @param {object} options - options containing optional AbortSignal
 * @returns {Promise<{ products: Array, total: number, page: number, totalPages: number }>}
 */
export function fetchProducts(query = '', page = 1, options = {}) {
  const signal = options?.signal;

  // Random delay between 100 and 800 ms as required by specification
  const delay = Math.floor(Math.random() * (800 - 100 + 1)) + 100;

  return new Promise((resolve, reject) => {
    // If signal already aborted before timeout starts
    if (signal?.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'));
    }

    const timer = setTimeout(() => {
      // Check if aborted during wait
      if (signal?.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'));
      }

      const cleanQuery = (query || '').trim().toLowerCase();

      // Filter products by query (matching name, category, or description)
      const filtered = MOCK_DATABASE.filter(item => {
        if (!cleanQuery) return true;
        return (
          item.name.toLowerCase().includes(cleanQuery) ||
          item.category.toLowerCase().includes(cleanQuery) ||
          item.description.toLowerCase().includes(cleanQuery)
        );
      });

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
      const validPage = Math.min(Math.max(1, page), totalPages);

      const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
      const paginatedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      resolve({
        products: paginatedProducts,
        total,
        page: validPage,
        totalPages
      });
    }, delay);

    // Attach abort listener if signal is provided
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    }
  });
}
