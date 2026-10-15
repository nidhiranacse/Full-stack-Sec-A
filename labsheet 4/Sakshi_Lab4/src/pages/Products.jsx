import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

const skincareProducts = [
  {
    id: 1,
    name: "Gentle Face Cleanser",
    category: "CLEANSER",
    price: 499,
    emoji: "🫧",
    description:
      "A gentle cleanser designed to refresh the skin without leaving it feeling dry.",
  },
  {
    id: 2,
    name: "Hydrating Serum",
    category: "SERUM",
    price: 799,
    emoji: "💧",
    description:
      "A lightweight hydrating serum for soft and refreshed-looking skin.",
  },
  {
    id: 3,
    name: "Silk Moisture Cream",
    category: "MOISTURIZER",
    price: 699,
    emoji: "🤍",
    description:
      "A smooth daily moisturizer that helps maintain comfortable, hydrated skin.",
  },
  {
    id: 4,
    name: "Daily Sunscreen",
    category: "SUN CARE",
    price: 849,
    emoji: "☀️",
    description:
      "A lightweight sunscreen designed for comfortable everyday use.",
  },
  {
    id: 5,
    name: "Overnight Repair Serum",
    category: "NIGHT CARE",
    price: 899,
    emoji: "🌙",
    description:
      "A nourishing nighttime serum for a simple evening skincare ritual.",
  },
];

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(skincareProducts);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-icon">✦</div>
        <h2>Loading collection...</h2>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  return (
    <main className="products-page">
      <section className="page-heading">
        <p className="eyebrow">
          SILK SKIN COLLECTION
        </p>

        <h1>Our Skincare</h1>

        <p>
          Explore our carefully selected skincare
          essentials.
        </p>
      </section>

      <section className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </section>
    </main>
  );
}

export default Products;