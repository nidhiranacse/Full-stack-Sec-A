import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import React from "react";

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                {
                    id: 1,
                    name: "Wireless Headphones",
                    price: 1999
                },
                {
                    id: 2,
                    name: "Smart Watch",
                    price: 2999
                },
                {
                    id: 3,
                    name: "Mechanical Keyboard",
                    price: 3499
                },
                {
                    id: 4,
                    name: "Gaming Mouse",
                    price: 1499
                }
            ]);

            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <section className="page">
                <div className="loading">
                    Loading products...
                </div>
            </section>
        );
    }

    return (
        <section className="page">
            <h1>Products</h1>

            <div className="products-grid">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>
        </section>
    );
}

export default Products;