import { Link } from "react-router-dom";

// Catch-all 404 page for unknown URLs.
function NotFound() {
  return (
    <main className="page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <Link to="/">Go Home</Link>
    </main>
  );
}

export default NotFound;
