
import Cart from "./Cart";

const products = [
  { id: 1, name: "Keyboard", price: 500 },
  { id: 2, name: "Mouse", price: 300 },
  { id: 3, name: "Headphones", price: 400 },
];

export default function App() {
  return (
    <div>
      <h1>Shopping Cart Practical</h1>
      <Cart products={products} />
    </div>
  );
}
 