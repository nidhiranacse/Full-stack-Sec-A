import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found">
      <p className="error-number">404</p>

      <h1>Page Not Found</h1>

      <p>
        The page you're looking for doesn't exist.
      </p>

      <Link to="/" className="primary-btn">
        Return Home
      </Link>
    </main>
  );
}

export default NotFound;