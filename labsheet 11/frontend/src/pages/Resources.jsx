// Author: Radha Pandey, CSE - CampusConnect
import { useEffect, useState } from 'react';
import api, { downloadResource, errMsg } from '../api';
import Pagination from '../components/Pagination';

export default function Resources() {
  const [filters, setFilters] = useState({ q: '', subject: '', semester: '' });
  const [debounced, setDebounced] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(filters); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/resources', { params: { ...debounced, page, limit: 10 } })
      .then((r) => active && setData(r.data))
      .catch((e) => active && setError(errMsg(e)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [debounced, page]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <section>
      <h2>Resources</h2>
      <div className="filters">
        <input placeholder="Search title..." value={filters.q} onChange={set('q')} />
        <input placeholder="Subject" value={filters.subject} onChange={set('subject')} />
        <select value={filters.semester} onChange={set('semester')}>
          <option value="">All semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && data.data.length === 0 && <p>No resources found.</p>}
      <div className="grid">
        {data.data.map((r) => (
          <article className="card" key={r.id}>
            <h3>{r.title}</h3>
            <p className="muted">{r.subject} | Semester {r.semester}</p>
            <p className="muted">{r.originalName} ({Math.round(r.size / 1024)} KB)</p>
            <button onClick={() => downloadResource(r).catch((e) => setError(errMsg(e)))}>Download</button>
          </article>
        ))}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </section>
  );
}
