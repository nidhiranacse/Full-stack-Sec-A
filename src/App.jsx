
import Cart from "./Cart";

const products = [
  { id: 1, name: "Shoes", price: 999 },
  { id: 2, name: "T-Shirt", price: 499 },
  { id: 3, name: "Watch", price: 1999 },
  { id: 4, name: "Bag", price: 799 },
];

export default function App() {
  return (
    <div>
      <h1>Practical B2: Shopping Cart with Discount</h1>
      <Cart products={products} />
    </div>
  );
}
