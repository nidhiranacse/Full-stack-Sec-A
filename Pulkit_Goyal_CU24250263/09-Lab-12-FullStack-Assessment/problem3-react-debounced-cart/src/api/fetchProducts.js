const mockCatalog = [
  { id: 1, name: 'Wireless Noise Cancelling Headphones', category: 'Audio', price: 6999, stock: 15 },
  { id: 2, name: 'Ultra-Wide 34-inch Curved Monitor', category: 'Display', price: 34999, stock: 7 },
  { id: 3, name: 'Mechanical Keychron Keyboard K2', category: 'Peripherals', price: 7499, stock: 20 },
  { id: 4, name: 'Logitech MX Master 3S Mouse', category: 'Peripherals', price: 8995, stock: 12 },
  { id: 5, name: 'Aluminum Laptop Riser Stand', category: 'Accessories', price: 1499, stock: 35 },
  { id: 6, name: 'USB-C Thunderbolt 4 Cable 2M', category: 'Accessories', price: 1299, stock: 50 }
];

export async function fetchProducts(query = '') {
  // Simulate network latency (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!query.trim()) return mockCatalog;

  const q = query.toLowerCase();
  return mockCatalog.filter(
    (item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );
}
