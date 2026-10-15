// Author: Radha Pandey, CSE - CampusConnect
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadResource, errMsg } from '../api';

export default function StudentDashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/student').then((r) => setD(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!d) return <p>Loading...</p>;

  const Row = ({ r }) => (
    <li>
      <strong>{r.event.title}</strong> <span className="muted">{new Date(r.event.date).toLocaleString()} | {r.event.venue}</span>
    </li>
  );

  return (
    <section>
      <h2>My Dashboard</h2>
      <div className="stats">
        <div className="card stat"><h3>{d.totalRegistrations}</h3><p>Total registrations</p></div>
        <div className="card stat"><h3>{d.upcoming.length}</h3><p>Upcoming events</p></div>
        <div className="card stat"><h3>{d.history.length}</h3><p>Attended / past</p></div>
      </div>

      <div className="card">
        <h3>My upcoming events</h3>
        {d.upcoming.length === 0 ? <p>None yet. <Link to="/">Browse events</Link></p> : <ul>{d.upcoming.map((r) => <Row key={r.registrationId} r={r} />)}</ul>}
      </div>
      <div className="card">
        <h3>Registration history</h3>
        {d.history.length === 0 ? <p>No past events.</p> : <ul>{d.history.map((r) => <Row key={r.registrationId} r={r} />)}</ul>}
      </div>
      <div className="card">
        <h3>Latest resources</h3>
        {d.latestResources.length === 0 && <p>No resources uploaded yet.</p>}
        <ul>
          {d.latestResources.map((r) => (
            <li key={r.id}>
              {r.title} <span className="muted">({r.subject}, Sem {r.semester})</span>{' '}
              <button className="link" onClick={() => downloadResource(r)}>Download</button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
