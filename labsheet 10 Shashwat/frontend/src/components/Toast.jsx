import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

let idCounter = 0;

export default function Toast() {
  const { socket } = useAuth();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!socket) return;

    function onAnnouncement(announcement) {
      const id = ++idCounter;
      setToasts((prev) => [{ id, ...announcement }, ...prev]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    }

    socket.on('new_announcement', onAnnouncement);
    return () => socket.off('new_announcement', onAnnouncement);
  }, [socket]);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <span className="toast-icon">📢</span>
          <div className="toast-body">
            <h4>New Announcement</h4>
            <p><strong>{toast.title}:</strong> {toast.content}</p>
          </div>
          <button
            className="toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
          >×</button>
        </div>
      ))}
    </div>
  );
}
