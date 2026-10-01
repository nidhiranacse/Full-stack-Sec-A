import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissNotification } from '../store/eventSlice';

export default function Toasts() {
  const list = useSelector((s) => s.events.notifications).slice(0, 3);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!list.length) return;
    const t = setTimeout(() => dispatch(dismissNotification(list[list.length - 1]._id)), 8000);
    return () => clearTimeout(t);
  }, [list.length]);
  return (
    <div className="toasts" role="status">
      {list.map((n) => (
        <div className="toast" key={n._id}>
          <strong>📢 {n.title}</strong><p>{n.body}</p>
          <small>Posted by {n.by}</small>
          <button className="x" onClick={() => dispatch(dismissNotification(n._id))}>×</button>
        </div>))}
    </div>
  );
}
