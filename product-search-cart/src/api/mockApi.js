const products = [
  {
    id: 1,
    title: "Laptop",
    price: 55000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "Smartphone",
    price: 25000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "Headphones",
    price: 2500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "Keyboard",
    price: 1800,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "Mouse",
    price: 900,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    title: "Monitor",
    price: 15000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    title: "Tablet",
    price: 22000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    title: "Smart Watch",
    price: 5000,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    title: "Backpack",
    price: 1500,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10,
    title: "USB Cable",
    price: 500,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    title: "Webcam",
    price: 3500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    title: "Printer",
    price: 12000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80"
  }
];

export function fetchProducts(query = "", page = 1) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 700) + 100;

    setTimeout(() => {
      const search = query.trim().toLowerCase();

      const filteredProducts = products.filter((product) =>
        `${product.title} ${product.category}`
          .toLowerCase()
          .includes(search)
      );

      const pageSize = 4;

      const totalPages = Math.max(
        1,
        Math.ceil(filteredProducts.length / pageSize)
      );

      const currentPage = Math.min(page, totalPages);

      const startIndex = (currentPage - 1) * pageSize;

      const pageProducts = filteredProducts.slice(
        startIndex,
        startIndex + pageSize
      );

      resolve({
        products: pageProducts,
        totalPages,
        page: currentPage
      });
    }, delay);
  });
}
