import React, { useState } from 'react';
import './App.css';

/**
 * CampusConnect University Portal
 * Author: Pulkit Goyal (CUID: CU24250263 | Roll: 40 | Section: A)
 */
export default function App() {
  const [role, setRole] = useState('admin'); // 'admin' | 'student'
  const [resources, setResources] = useState([
    { id: 1, title: 'Full Stack Development Lab Manual & Code Examples', subject: 'CS301', type: 'PDF', size: '3.4 MB' },
    { id: 2, title: 'Database Indexing & Query Tuning Guide', subject: 'CS302', type: 'PDF', size: '1.8 MB' },
    { id: 3, title: 'Software Engineering Agile Sprint Guidelines', subject: 'CS303', type: 'PDF', size: '2.1 MB' }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('CS301');

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setResources([
      ...resources,
      { id: Date.now(), title: newTitle.trim(), subject: newSubject, type: 'PDF', size: '2.0 MB' }
    ]);
    setNewTitle('');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand">
          <span>🏛️ CampusConnect University Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', background: 'white', border: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            <option value="admin">View as: Admin (Pulkit)</option>
            <option value="student">View as: Student (Pulkit)</option>
          </select>
          <div className="badge">
            Pulkit Goyal &bull; CU24250263 &bull; Roll 40 (Sec A)
          </div>
        </div>
      </nav>

      <main className="container">
        {/* Metric Cards */}
        <div className="metrics-row">
          <div className="metric-box">
            <h3>1,420</h3>
            <p>Active Students Enrolled</p>
          </div>
          <div className="metric-box">
            <h3>18</h3>
            <p>Upcoming Campus Events</p>
          </div>
          <div className="metric-box">
            <h3>{resources.length}</h3>
            <p>Study Notes &amp; Handbooks</p>
          </div>
          <div className="metric-box">
            <h3 style={{ color: '#10b981' }}>1.4 ms</h3>
            <p>Indexed Query Speed (B-Tree)</p>
          </div>
        </div>

        {/* Resources Repository */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>📚 University Course Resource Repository</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Curated lecture notes, lab guides, and benchmark manuals.
              </p>
            </div>
          </div>

          <div className="resource-grid">
            {resources.map((res) => (
              <div key={res.id} className="resource-card">
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0284c7' }}>{res.subject} &bull; {res.type}</span>
                  <h4 style={{ margin: '6px 0 10px', fontSize: '1rem' }}>{res.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Size: {res.size}</span>
                </div>
                <button
                  onClick={() => alert(`Downloading verified academic resource: ${res.title}`)}
                  className="btn"
                  style={{ marginTop: '16px', fontSize: '0.85rem', textAlign: 'center' }}
                >
                  Download Asset ↓
                </button>
              </div>
            ))}
          </div>

          {/* Admin Upload Control */}
          {role === 'admin' && (
            <form onSubmit={handleUpload} style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
              <h4 style={{ margin: '0 0 10px' }}>Upload New Course Material (Admin RBAC Only)</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Material title (e.g., CSE Unit 3 Notes)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ flex: 2, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  required
                />
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="CS301">CS301 (Full Stack)</option>
                  <option value="CS302">CS302 (DBMS)</option>
                  <option value="CS303">CS303 (Software Eng)</option>
                </select>
                <button type="submit" className="btn">
                  + Upload Document
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
