import React from "react";
import Cart from "./Cart";

const products = [
  {
    id: 1,
    name: "Notebook",
    price: 100,
    emoji: "📓",
    description: "Perfect for notes and daily planning."
  },
  {
    id: 2,
    name: "College Bag",
    price: 800,
    emoji: "🎒",
    description: "Stylish, spacious and comfortable."
  },
  {
    id: 3,
    name: "Headphones",
    price: 500,
    emoji: "🎧",
    description: "Enjoy your favorite music anywhere."
  },
  {
    id: 4,
    name: "Pen",
    price: 50,
    emoji: "🖊️",
    description: "Smooth writing for everyday use."
  }
];

export default function App() {
  return <Cart products={products} />;
}