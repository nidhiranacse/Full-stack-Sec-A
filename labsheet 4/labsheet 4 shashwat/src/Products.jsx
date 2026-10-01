import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { products } from './data.js'
import { useCart } from './CartContext.jsx'

/* ========================
   Products Page
   - Simulates loading state with useEffect + setTimeout
   - Displays product cards in a grid
   - Each card links to /products/:id (route params)
   - Add to cart button uses Context API
   ======================== */

function Products() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const { addToCart, isInCart } = useCart()

  // Simulate fetching data with a loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(products)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="products-page">
      <h2>Our Products</h2>
      <p className="page-subtitle">Click on a product to see details</p>

      <div className="product-grid">
        {items.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-emoji">{product.image}</div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">₹{product.price}</p>
              <div className="product-actions">
                <Link to={`/products/${product.id}`} className="btn btn-small">
                  View Details
                </Link>
                <button
                  className={`btn btn-small ${isInCart(product.id) ? 'btn-added' : 'btn-cart'}`}
                  onClick={() => addToCart(product)}
                  disabled={isInCart(product.id)}
                >
                  {isInCart(product.id) ? '✓ Added' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products
