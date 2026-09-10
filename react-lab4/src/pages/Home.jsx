import { Link } from "react-router-dom";

function Home() {

    return (
        <div className="page">

            <h1>Welcome to My Store</h1>

            <p>
                Explore our collection of amazing products.
            </p>

            <Link to="/products">
                <button>View Products</button>
            </Link>

        </div>
    );
}

export default Home;