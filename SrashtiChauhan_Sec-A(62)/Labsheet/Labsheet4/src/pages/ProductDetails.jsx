import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import React from "react";

const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 1999,
        description: "High-quality wireless headphones with clear sound."
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 2999,
        description: "A smart watch with fitness and notification features."
    },
    {
        id: 3,
        name: "Mechanical Keyboard",
        price: 3499,
        description: "A responsive mechanical keyboard for work and gaming."
    },
    {
        id: 4,
        name: "Gaming Mouse",
        price: 1499,
        description: "Fast and accurate mouse designed for gaming."
    }
];

function ProductDetails() {
    const { id } = useParams();
    const { addToCart } = useCart();

    const product = products.find(
        (item) => item.id === Number(id)
    );

    if (!product) {
        return (
            <section className="page">
                <h1>Product Not Found</h1>

                <Link to="/products">
                    Back to Products
                </Link>
            </section>
        );
    }

    return (
        <section className="page product-details">
            <h1>{product.name}</h1>

            <h2>₹{product.price}</h2>

            <p>{product.description}</p>

            <button onClick={() => addToCart(product)}>
                Add to Cart
            </button>

            <br />
            <br />

            <Link to="/products">
                ← Back to Products
            </Link>
        </section>
    );
}

export default ProductDetails;