import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalAmount, totalItemsCount } = useCart();

  const tax = Math.round(totalAmount * 0.18); // 18% GST
  const grandTotal = totalAmount + tax;

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛍️</div>
        <h2>Your Cart is Currently Empty</h2>
        <p style={{ color: '#64748b', margin: '8px 0 24px' }}>Looks like you haven't added any products yet.</p>
        <Link to="/products" className="btn-primary">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Shopping Cart ({totalItemsCount} items)</h1>
        <button
          onClick={clearCart}
          style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          Clear All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
        {/* Cart Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              <div style={{ fontSize: '2.5rem', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>{item.image}</div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{item.name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>₹{item.price.toLocaleString()} each</p>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ width: '28px', height: '28px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ width: '28px', height: '28px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              <div style={{ fontWeight: 800, minWidth: '80px', textAlign: 'right' }}>
                ₹{(item.price * item.quantity).toLocaleString()}
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
                title="Remove item"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Subtotal</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Estimated GST (18%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#64748b' }}>Shipping</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginBottom: '20px', fontSize: '1.15rem', fontWeight: 800 }}>
            <span>Total</span>
            <span style={{ color: '#2563eb' }}>₹{grandTotal.toLocaleString()}</span>
          </div>

          <button
            onClick={() => alert(`Order simulated successfully for Pulkit Goyal (CU24250263)!\nTotal Paid: ₹${grandTotal.toLocaleString()}`)}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
