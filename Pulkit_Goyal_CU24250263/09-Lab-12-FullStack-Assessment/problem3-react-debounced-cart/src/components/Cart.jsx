import React from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 6px', color: '#64748b' }}>Shopping Cart is Empty</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Search and add products to start checkout.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Cart Summary ({totalQuantity} items)</h3>
        <button
          onClick={clearCart}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          Clear
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>₹{item.price.toLocaleString()} each</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ width: '24px', height: '24px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ width: '24px', height: '24px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                +
              </button>
            </div>

            <div style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right', fontSize: '0.95rem' }}>
              ₹{(item.price * item.quantity).toLocaleString()}
            </div>

            <button
              onClick={() => removeItem(item.id)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', paddingLeft: '8px', fontSize: '1.1rem' }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '2px solid #e2e8f0', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Amount:</span>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#2563eb' }}>₹{totalAmount.toLocaleString()}</span>
      </div>

      <button
        onClick={() => alert(`Simulated Checkout for Pulkit Goyal (CU24250263)\nTotal Amount: ₹${totalAmount.toLocaleString()}`)}
        style={{ width: '100%', marginTop: '16px', background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
      >
        Complete Order
      </button>
    </div>
  );
}
