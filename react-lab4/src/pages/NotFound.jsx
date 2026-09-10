import { Link } from "react-router-dom";

function NotFound() {

    return (
        <div className="page">

            <h1>404</h1>

            <h2>Page Not Found</h2>

            <p>
                Sorry, the page you are looking for does not exist.
            </p>

            <Link to="/">
                Go to Home
            </Link>

        </div>
    );
}

export default NotFound;