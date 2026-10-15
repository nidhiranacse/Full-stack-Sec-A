// Author: Radha Pandey, CSE - CampusConnect
import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import AdminEvents from './AdminEvents';
import AdminResources from './AdminResources';

function Analytics() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/dashboard/admin').then((r) => setD(r.data)).catch((e) => setError(errMsg(e)));
  }, []);
  if (error) return <p className="error">{error}</p>;
  if (!d) return <p>Loading...</p>;
  return (
    <>
      <div className="stats">
        <div className="card stat"><h3>{d.totalEvents}</h3><p>Total events</p></div>
        <div className="card stat"><h3>{d.totalRegistrations}</h3><p>Total registrations</p></div>
        <div className="card stat"><h3>{d.totalStudents}</h3><p>Students</p></div>
        <div className="card stat"><h3>{d.totalResources}</h3><p>Resources</p></div>
      </div>
      <div className="card">
        <h3>Most popular events</h3>
        <ul>
          {d.topEvents.map((e) => (
            <li key={e.id}>{e.title} <span className="muted">{e.registered}/{e.capacity} registered</span></li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('analytics');
  return (
    <section>
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        {['analytics', 'events', 'resources'].map((t) => (
          <button key={t} className={tab === t ? '' : 'secondary'} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'analytics' && <Analytics />}
      {tab === 'events' && <AdminEvents />}
      {tab === 'resources' && <AdminResources />}
    </section>
  );
}
