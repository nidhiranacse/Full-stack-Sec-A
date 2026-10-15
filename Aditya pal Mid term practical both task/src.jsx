import React from "react";
import Cart from "./Cart";

const products = [
  { id: 1, name: "Laptop", price: 800 },
  { id: 2, name: "Mouse", price: 200 },
  { id: 3, name: "Keyboard", price: 300 }
];

export default function App() {
  return <Cart products={products} />;
}