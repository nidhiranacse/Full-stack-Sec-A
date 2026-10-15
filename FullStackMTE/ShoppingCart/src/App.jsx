
import React from "react";
import Cart from "./Cart";

const products = [
  { id: 1, name: "Tote Bag", price: 450 },
  { id: 2, name: "Rose Hair Clip", price: 150 },
  { id: 3, name: "Blush Notebook", price: 250 },
  { id: 4, name: "Keychain", price: 100 },
  { id: 5, name: "Floral Pouch", price: 300 },
  { id: 6, name: "Pearl Bracelet", price: 200 },
];

export default function App() {
  return <Cart products={products} />;
}
