import React from 'react';
import Cart from './Cart';

const products = [
{ id: 1, name: 'Keyboard', price: 500 },
{ id: 2, name: 'Mouse', price: 300 },
{ id: 3, name: 'Headphones', price: 700 }
];

export default function App() {
return <Cart products={products} />;
}
