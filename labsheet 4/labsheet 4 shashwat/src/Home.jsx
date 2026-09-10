import { Link } from 'react-router-dom'

/* ========================
   Home Page
   - Landing page with welcome message
   - Link to browse products
   ======================== */

function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to ShopApp</h1>
        <p>Browse our collection of products and add your favorites to cart.</p>
        <Link to="/products" className="btn btn-primary">Browse Products →</Link>
      </div>
    </div>
  )
}

export default Home
