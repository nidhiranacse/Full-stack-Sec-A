import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

function ProductDetails() {

    const { id } = useParams();

    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(true);

        // Simulate API loading
        setTimeout(() => {

            const products = [
                {
                    id: 1,
                    name: "Laptop",
                    price: 60000,
                    description:
                        "Powerful laptop suitable for programming, gaming and office work."
                },
                {
                    id: 2,
                    name: "Smartphone",
                    price: 25000,
                    description:
                        "Modern smartphone with a high-quality display and camera."
                },
                {
                    id: 3,
                    name: "Headphones",
                    price: 3000,
                    description:
                        "Wireless headphones with excellent sound quality."
                }
            ];

            const foundProduct = products.find(
                item => item.id === Number(id)
            );

            setProduct(foundProduct);

            setLoading(false);

        }, 1000);

    }, [id]);

    if (loading) {
        return (
            <div className="page">
                <h2>Loading product...</h2>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page">
                <h2>Product not found</h2>

                <Link to="/products">
                    Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="page">

            <h1>{product.name}</h1>

            <h2>₹{product.price}</h2>

            <p>{product.description}</p>

            <button
                onClick={() => addToCart(product)}
            >
                Add to Cart
            </button>

            <br />
            <br />

            <Link to="/products">
                ← Back to Products
            </Link>

        </div>
    );
}

export default ProductDetails;