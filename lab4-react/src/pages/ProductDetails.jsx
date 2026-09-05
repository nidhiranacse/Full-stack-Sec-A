import { Link, useParams } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 60000,
    description: "Powerful laptop for programming and daily use."
  },
  {
    id: 2,
    name: "Smartphone",
    price: 25000,
    description: "Modern smartphone with excellent performance."
  },
  {
    id: 3,
    name: "Headphones",
    price: 3000,
    description: "Wireless headphones with high quality sound."
  },
  {
    id: 4,
    name: "Keyboard",
    price: 1500,
    description: "Mechanical keyboard suitable for programmers."
  }
];

function ProductDetails() {
  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <div>
        <h1>Product Not Found</h1>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{product.name}</h1>

      <h2>Price: ₹{product.price}</h2>

      <p>{product.description}</p>

      <Link to="/products">
        ← Back to Products
      </Link>
    </div>
  );
}

export default ProductDetails;