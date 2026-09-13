import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="page home-page">
            <div className="hero">
                <span className="hero-tag">React Product Store</span>
                <h1>Simple shopping made easy.</h1>
                <p>
                    Explore useful tech products, view their details and add
                    your favourites to the cart.
                </p>
                <Link to="/products" className="primary-button">
                    Browse Products
                </Link>
            </div>

            <div className="home-features">
                <div>
                    <h3>Easy Navigation</h3>
                    <p>Move between pages without reloading the website.</p>
                </div>
                <div>
                    <h3>Product Details</h3>
                    <p>Open any product to see its complete information.</p>
                </div>
                <div>
                    <h3>Global Cart</h3>
                    <p>Your cart remains available across different pages.</p>
                </div>
            </div>
        </div>
    );
}

export default Home;