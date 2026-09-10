import { Link } from 'react-router-dom'

/* ========================
   404 Not Found Page
   - Catches all unmatched routes via Route path="*"
   ======================== */

function NotFound() {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">← Go Home</Link>
    </div>
  )
}

export default NotFound
