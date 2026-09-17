import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from './data.js'
import { useCart } from './CartContext.jsx'

/* ========================
   Product Details Page
   - Uses useParams() to get product ID from route
   - Simulates loading state
   - Shows full product info
   - Add to cart via Context API
   ======================== */

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart, isInCart } = useCart()

  // Simulate fetching single product by route param
  useEffect(() => {
    const timer = setTimeout(() => {
      const found = products.find((p) => p.id === parseInt(id))
      setProduct(found || null)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [id])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="not-found-page">
        <h2>Product Not Found</h2>
        <p>No product exists with ID: {id}</p>
        <Link to="/products" className="btn btn-primary">← Back to Products</Link>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <Link to="/products" className="back-link">← Back to Products</Link>

      <div className="detail-card">
        <div className="detail-emoji">{product.image}</div>
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h2>{product.name}</h2>
          <p className="detail-price">₹{product.price}</p>
          <p className="detail-desc">{product.description}</p>
          <button
            className={`btn ${isInCart(product.id) ? 'btn-added' : 'btn-primary'}`}
            onClick={() => addToCart(product)}
            disabled={isInCart(product.id)}
          >
            {isInCart(product.id) ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
