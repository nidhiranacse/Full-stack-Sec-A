import products from "./products";

const PAGE_SIZE = 4;

export function fetchProducts(query = "", page = 1) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 701) + 100;

    setTimeout(() => {
      const normalizedQuery = query.trim().toLowerCase();

      const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(normalizedQuery)
      );

      const startIndex = (page - 1) * PAGE_SIZE;
      const pageItems = filteredProducts.slice(
        startIndex,
        startIndex + PAGE_SIZE
      );

      resolve({
        data: pageItems,
        total: filteredProducts.length,
        page,
        pageSize: PAGE_SIZE,
      });
    }, delay);
  });
}