const products = [
  { id: 1, name: "Laptop", price: 75000 },
  { id: 2, name: "Wireless Mouse", price: 1200 },
  { id: 3, name: "Mechanical Keyboard", price: 4500 },
  { id: 4, name: "USB-C Hub", price: 2200 },
  { id: 5, name: "Monitor", price: 18000 },
  { id: 6, name: "Webcam", price: 3500 },
  { id: 7, name: "Headphones", price: 2800 },
  { id: 8, name: "Laptop Stand", price: 1800 },
  { id: 9, name: "External SSD", price: 6500 },
  { id: 10, name: "Bluetooth Speaker", price: 3200 },
  { id: 11, name: "Smartphone", price: 35000 },
  { id: 12, name: "Tablet", price: 28000 },
];

export function fetchProducts(query, page = 1) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 700) + 100;

    setTimeout(() => {
      const search = query.trim().toLowerCase();

      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(search)
      );

      const pageSize = 4;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      resolve({
        data,
        page,
        total: filtered.length,
        pageSize,
      });
    }, delay);
  });
}