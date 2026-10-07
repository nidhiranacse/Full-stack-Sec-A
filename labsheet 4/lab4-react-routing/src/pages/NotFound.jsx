import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="error-page">

      <div className="error-content">

        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p>
          Sorry, the page you are looking for doesn't exist.
        </p>

        <Link to="/" className="home-button">
          Go to Home
        </Link>

      </div>

      <div className="error-illustration">

        <div className="error-circle"></div>

        <div className="error-girl">

          <div className="error-hair"></div>

          <div className="error-head">
            <div className="eye"></div>
            <div className="eye"></div>
            <div className="question">?</div>
          </div>

          <div className="error-body"></div>

          <div className="laptop">
            💻
          </div>

          <div className="plant plant-left">
            🌿
          </div>

          <div className="plant plant-right">
            🌿
          </div>

        </div>

      </div>

    </div>
  );
}

export default NotFound;