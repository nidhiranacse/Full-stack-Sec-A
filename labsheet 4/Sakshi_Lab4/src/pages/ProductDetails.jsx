import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const products = [
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

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <div className="not-found">
        <h1>Product Not Found</h1>

        <p>
          We couldn't find the skincare product
          you're looking for.
        </p>

        <Link to="/products" className="primary-btn">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <main className="details-page">
      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>

      <section className="details-card">
        <div className="details-image">
          {product.emoji}
        </div>

        <div className="details-content">
          <p className="eyebrow">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p className="details-price">
            ₹{product.price}
          </p>

          <p className="details-description">
            {product.description}
          </p>

          <button
            className="primary-btn"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;