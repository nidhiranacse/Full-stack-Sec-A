
const allProducts = [
  {
    id: 1,
    name: "Classic White Sneakers",
    category: "Footwear",
    price: 2499,
    rating: 4.8,
    description: "Everyday comfort with a clean, timeless look.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  },
  {
    id: 2,
    name: "Minimal Leather Backpack",
    category: "Accessories",
    price: 3299,
    rating: 4.7,
    description: "A stylish backpack for work and everyday travel.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
  },
  {
    id: 3,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 4599,
    rating: 4.9,
    description: "Enjoy your favourite music with rich sound.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
  },
  {
    id: 4,
    name: "Classic Wrist Watch",
    category: "Accessories",
    price: 2799,
    rating: 4.6,
    description: "A simple design that suits every occasion.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
  },
  {
    id: 5,
    name: "Everyday Running Shoes",
    category: "Footwear",
    price: 3599,
    rating: 4.8,
    description: "Lightweight shoes made for daily movement.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  },
  {
    id: 6,
    name: "Modern Sunglasses",
    category: "Accessories",
    price: 1499,
    rating: 4.5,
    description: "A versatile accessory for sunny days.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
  },
  {
    id: 7,
    name: "Desk Table Lamp",
    category: "Home",
    price: 1899,
    rating: 4.4,
    description: "Bring a warm glow to your study space.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"
  },
  {
    id: 8,
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 499,
    rating: 4.3,
    description: "A simple mug for your daily coffee.",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"
  },
  {
    id: 9,
    name: "Travel Water Bottle",
    category: "Accessories",
    price: 799,
    rating: 4.5,
    description: "A practical companion for your busy day.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"
  },
  {
    id: 10,
    name: "Wireless Speaker",
    category: "Electronics",
    price: 2199,
    rating: 4.6,
    description: "Compact sound for your desk or bedroom.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
  },
  {
    id: 11,
    name: "Casual Canvas Bag",
    category: "Accessories",
    price: 999,
    rating: 4.4,
    description: "A lightweight bag for everyday essentials.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600"
  },
  {
    id: 12,
    name: "Classic Sports Cap",
    category: "Clothing",
    price: 699,
    rating: 4.2,
    description: "A comfortable cap with a minimal design.",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"
  }
];

const PAGE_SIZE = 6;

export function fetchProducts(query, page) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 701) + 100;

    setTimeout(() => {
      const searchText = query.trim().toLowerCase();

      const filteredProducts = allProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchText) ||
          product.category.toLowerCase().includes(searchText)
        );
      });

      const total = filteredProducts.length;
      const totalPages = Math.ceil(total / PAGE_SIZE);

      const startIndex = (page - 1) * PAGE_SIZE;
      const products = filteredProducts.slice(
        startIndex,
        startIndex + PAGE_SIZE
      );

      resolve({
        products,
        total,
        totalPages
      });
    }, delay);
  });
}
