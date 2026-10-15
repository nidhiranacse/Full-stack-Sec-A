import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 55000,
    description: "Powerful laptop for students and professionals.",
  },
  {
    id: 2,
    name: "Smartphone",
    price: 25000,
    description: "Modern smartphone with excellent performance.",
  },
  {
    id: 3,
    name: "Headphones",
    price: 3000,
    description: "Wireless headphones with clear sound.",
  },
];

function Products() {
  const { addToCart } = useCart();

  return (
    <div className="page">
      <h1>Products</h1>

      <div className="products">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <h2>{product.name}</h2>

            <p>Price: ₹{product.price}</p>

            <Link to={`/products/${product.id}`}>
              View Details
            </Link>

            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export { products };
export default Products;