import { Link } from "react-router-dom";
import React from "react";

function Home() {
    return (
        <section className="home">
            <h1>Welcome to MiniStore</h1>

            <p>
                Find useful products at simple and affordable prices.
            </p>

            <Link to="/products" className="primary-btn">
                Explore Products
            </Link>
        </section>
    );
}

export default Home;