import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dismissToast } from '../store/announcementSlice';
import { Bell, X, AlertCircle } from 'lucide-react';

const Toast = () => {
  const toasts = useSelector((state) => state.announcements.toasts);
  const dispatch = useDispatch();

  useEffect(() => {
    if (toasts.length > 0) {
      const latestToast = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        dispatch(dismissToast(latestToast.id));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          <div style={{ color: '#818cf8', marginTop: 2 }}>
            <Bell size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <strong style={{ fontSize: '0.92rem', color: '#f3f4f6' }}>{toast.title}</strong>
              <span className={`badge badge-priority-${toast.priority?.toLowerCase() || 'medium'}`}>
                {toast.priority}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.4 }}>
              {toast.message}
            </p>
            <span style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 4, display: 'block' }}>
              Just now • {toast.timestamp}
            </span>
          </div>
          <button
            onClick={() => dispatch(dismissToast(toast.id))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
