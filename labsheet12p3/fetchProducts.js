export function fetchProducts(query, page) {
  return new Promise((resolve) => {
    const delay =
      Math.floor(Math.random() * 700) + 100;

    setTimeout(() => {
      const allProducts = [
        {
          id: 1,
          name: "Laptop",
          price: 50000
        },
        {
          id: 2,
          name: "Mobile",
          price: 25000
        },
        {
          id: 3,
          name: "Keyboard",
          price: 1500
        },
        {
          id: 4,
          name: "Mouse",
          price: 800
        },
        {
          id: 5,
          name: "Headphones",
          price: 2000
        }
      ];

      const filtered = allProducts.filter(
        p =>
          p.name
            .toLowerCase()
            .includes(query.toLowerCase())
      );

      resolve(filtered);
    }, delay);
  });
}