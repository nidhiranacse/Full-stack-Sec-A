import { useEffect, useState } from "react";
import products from "../products";
import ProductCard from "../components/ProductCard";

function Products() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="loader"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-heading">
                <span>Our Collection</span>
                <h1>Products</h1>
                <p>Choose a product and add it to your cart.</p>
            </div>

            <div className="product-grid">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default Products;