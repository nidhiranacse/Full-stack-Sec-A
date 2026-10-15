import React, { useState, useEffect } from 'react';
import './App.css';

// Pre-seeded quick credentials for easy evaluation
const DEMO_STUDENT = {
  id: 2,
  name: 'Rahul Raj',
  email: 'rahul.raj@cuchd.in',
  role: 'student',
  department: 'Computer Science & Engineering (Sec-A)',
  semester: 'Semester 6'
};

const DEMO_ADMIN = {
  id: 1,
  name: 'Dr. Ananya Sharma (Admin)',
  email: 'admin@campus.edu',
  role: 'admin',
  department: 'Computer Science & Engineering',
  semester: 'Faculty'
};

export default function App() {
  // Navigation & Authentication State
  const [activeTab, setActiveTab] = useState('events');
  const [user, setUser] = useState(DEMO_STUDENT);
  const [token, setToken] = useState('demo-token-active');
  const [toast, setToast] = useState(null);

  // Events State
  const [events, setEvents] = useState([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [eventSearch, setEventSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [eventsLoading, setEventsLoading] = useState(false);

  // Resources State
  const [resources, setResources] = useState([]);
  const [resourcesTotal, setResourcesTotal] = useState(0);
  const [resourcesPage, setResourcesPage] = useState(1);
  const [resourcesTotalPages, setResourcesTotalPages] = useState(1);
  const [resourceSearch, setResourceSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [resourcesLoading, setResourcesLoading] = useState(false);

  // Dashboard States
  const [studentDash, setStudentDash] = useState(null);
  const [adminDash, setAdminDash] = useState(null);

  // Benchmark State
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authFormData, setAuthFormData] = useState({ name: '', email: '', password: '', role: 'student', department: '', semester: '' });

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({ id: null, title: '', description: '', category: 'Workshop', date: '', time: '', venue: '', maxSeats: 50 });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({ title: '', description: '', subject: 'Full Stack Development', semester: 'Semester 6', fileType: 'pdf' });

  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState({ event: {}, attendees: [] });

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // API Call Wrapper with Auth Header
  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    try {
      const res = await fetch(endpoint, {
        ...options,
        headers
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    } catch (err) {
      return { status: 500, ok: false, data: { message: err.message } };
    }
  };

  // Fetch Events
  const fetchEvents = async (page = eventsPage, search = eventSearch, cat = selectedCategory, status = selectedStatus) => {
    setEventsLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      limit: '6',
      q: search,
      category: cat,
      status: status
    });

    const res = await apiFetch(`/api/events?${query.toString()}`);
    setEventsLoading(false);
    if (res.ok) {
      setEvents(res.data.events || []);
      setEventsTotal(res.data.pagination.total);
      setEventsPage(res.data.pagination.page);
      setEventsTotalPages(res.data.pagination.totalPages);
    }
  };

  // Fetch Resources
  const fetchResources = async (page = resourcesPage, search = resourceSearch, sub = selectedSubject, sem = selectedSemester, type = selectedFileType) => {
    setResourcesLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      limit: '6',
      q: search,
      subject: sub,
      semester: sem,
      fileType: type
    });

    const res = await apiFetch(`/api/resources?${query.toString()}`);
    setResourcesLoading(false);
    if (res.ok) {
      setResources(res.data.resources || []);
      setResourcesTotal(res.data.pagination.total);
      setResourcesPage(res.data.pagination.page);
      setResourcesTotalPages(res.data.pagination.totalPages);
    }
  };

  // Fetch Student Dashboard
  const fetchStudentDashboard = async () => {
    if (user.role !== 'student') return;
    const res = await apiFetch('/api/dashboard/student');
    if (res.ok) {
      setStudentDash(res.data);
    }
  };

  // Fetch Admin Dashboard
  const fetchAdminDashboard = async () => {
    if (user.role !== 'admin') return;
    const res = await apiFetch('/api/dashboard/admin');
    if (res.ok) {
      setAdminDash(res.data);
    }
  };

  // Run Indexing Benchmark
  const runBenchmark = async () => {
    setBenchmarkLoading(true);
    const res = await apiFetch('/api/benchmark/indexing');
    setBenchmarkLoading(false);
    if (res.ok) {
      setBenchmarkData(res.data);
      showToast('Database indexing benchmark completed across 10,000 records!', 'success');
    } else {
      showToast('Benchmark run failed', 'error');
    }
  };

  // Initial Load & Auth Simulation
  useEffect(() => {
    // Attempt login as current demo user to fetch a genuine backend JWT
    const syncToken = async () => {
      const email = user.email;
      const password = user.role === 'admin' ? 'Admin@123' : 'Rahul@123';
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setUser(data.user);
      }
    };
    syncToken();
  }, [user.email]);

  useEffect(() => {
    fetchEvents(1, eventSearch, selectedCategory, selectedStatus);
  }, [selectedCategory, selectedStatus, token]);

  useEffect(() => {
    fetchResources(1, resourceSearch, selectedSubject, selectedSemester, selectedFileType);
  }, [selectedSubject, selectedSemester, selectedFileType]);

  useEffect(() => {
    if (activeTab === 'student-dash') fetchStudentDashboard();
    if (activeTab === 'admin-dash') fetchAdminDashboard();
    if (activeTab === 'indexing' && !benchmarkData) runBenchmark();
  }, [activeTab, token]);

  // Handle Event RSVP
  const handleRegisterEvent = async (eventId, title) => {
    if (user.role !== 'student') {
      showToast('Only students can register for events', 'error');
      return;
    }

    const res = await apiFetch(`/api/events/${eventId}/register`, { method: 'POST' });
    if (res.ok) {
      showToast(`Successfully registered for ${title}!`, 'success');
      fetchEvents();
      if (activeTab === 'student-dash') fetchStudentDashboard();
    } else {
      showToast(res.data.message || 'Registration failed', 'error');
    }
  };

  const handleUnregisterEvent = async (eventId, title) => {
    const res = await apiFetch(`/api/events/${eventId}/unregister`, { method: 'POST' });
    if (res.ok) {
      showToast(`Cancelled registration for ${title}`, 'success');
      fetchEvents();
      if (activeTab === 'student-dash') fetchStudentDashboard();
    } else {
      showToast(res.data.message || 'Unregistration failed', 'error');
    }
  };

  // View Attendees (Admin)
  const handleViewAttendees = async (eventId) => {
    const res = await apiFetch(`/api/events/${eventId}/attendees`);
    if (res.ok) {
      setCurrentAttendees(res.data);
      setShowAttendeesModal(true);
    } else {
      showToast(res.data.message || 'Failed to fetch attendees roster', 'error');
    }
  };

  // Delete Event (Admin)
  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    const res = await apiFetch(`/api/events/${eventId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`Event deleted successfully`, 'success');
      fetchEvents();
      if (activeTab === 'admin-dash') fetchAdminDashboard();
    } else {
      showToast(res.data.message || 'Delete failed', 'error');
    }
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(eventFormData.id);
    const endpoint = isEdit ? `/api/events/${eventFormData.id}` : '/api/events';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiFetch(endpoint, {
      method,
      body: JSON.stringify(eventFormData)
    });

    if (res.ok) {
      showToast(`Event ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
      setShowEventModal(false);
      setEventFormData({ id: null, title: '', description: '', category: 'Workshop', date: '', time: '', venue: '', maxSeats: 50 });
      fetchEvents();
      if (activeTab === 'admin-dash') fetchAdminDashboard();
    } else {
      showToast(res.data.message || 'Operation failed', 'error');
    }
  };

  // Save Academic Resource
  const handleUploadResource = async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/resources', {
      method: 'POST',
      body: JSON.stringify(uploadFormData)
    });

    if (res.ok) {
      showToast('Academic resource uploaded successfully!', 'success');
      setShowUploadModal(false);
      setUploadFormData({ title: '', description: '', subject: 'Full Stack Development', semester: 'Semester 6', fileType: 'pdf' });
      fetchResources();
    } else {
      showToast(res.data.message || 'Upload failed', 'error');
    }
  };

  // Download Resource
  const handleDownloadResource = (resource) => {
    window.open(`/api/resources/${resource.id}/download`, '_blank');
    showToast(`Downloading: ${resource.fileName}`, 'success');
    setTimeout(fetchResources, 800);
  };

  // Quick Switch Roles
  const switchUser = async (demoUser) => {
    setUser(demoUser);
    const password = demoUser.role === 'admin' ? 'Admin@123' : 'Rahul@123';
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: demoUser.email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setToken(data.token);
      showToast(`Switched active session to ${demoUser.name} (${demoUser.role.toUpperCase()})`);
      if (demoUser.role === 'student' && activeTab === 'admin-dash') setActiveTab('events');
      if (demoUser.role === 'admin' && activeTab === 'student-dash') setActiveTab('events');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✔' : '✖'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Academic Submissions Header */}
      <div className="submission-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="tag">LAB SHEET 11</span>
          <span>Full Stack Development Practice Question &bull; B.Tech CSE 3rd Year</span>
        </div>
        <div>
          <span>Submitted by: </span>
          <span className="author">Rahul Raj (Roll: cu24250116)</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>Sec-A</span>
        </div>
      </div>

      {/* Sticky Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div>
              <div className="brand-name">CampusConnect</div>
              <div className="brand-sub">Event &amp; Resource Portal</div>
            </div>
          </div>

          <div className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              📅 Events
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              📚 Academic Resources
            </button>

            {user.role === 'student' && (
              <button
                className={`nav-tab-btn ${activeTab === 'student-dash' ? 'active' : ''}`}
                onClick={() => setActiveTab('student-dash')}
              >
                🎓 Student Dashboard
              </button>
            )}

            {user.role === 'admin' && (
              <button
                className={`nav-tab-btn ${activeTab === 'admin-dash' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin-dash')}
              >
                📊 Admin Analytics
              </button>
            )}

            <button
              className={`nav-tab-btn ${activeTab === 'indexing' ? 'active' : ''}`}
              onClick={() => setActiveTab('indexing')}
            >
              ⚡ Query Benchmark
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
            >
              📄 ER &amp; API Docs
            </button>
          </div>

          <div className="nav-user">
            <div className="user-badge">
              <span>{user.name.split(' ')[0]}</span>
              <span className={`role-pill ${user.role}`}>{user.role}</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAuthModal(true)}
            >
              Account
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Quick Role Switcher Banner */}
      <section className="hero">
        <div className="hero-text">
          <h1>Central Campus Event &amp; Academic Repository</h1>
          <p>
            Seamlessly browse college workshops, hackathons, placement drives with dynamic seat tracking, 
            and access semester notes with role-based access control.
          </p>
        </div>
        <div className="hero-quick-roles">
          <span className="quick-login-label">Quick Switch Role:</span>
          <button
            className={`btn btn-sm ${user.role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => switchUser(DEMO_STUDENT)}
          >
            👨‍🎓 Rahul Raj (Student)
          </button>
          <button
            className={`btn btn-sm ${user.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => switchUser(DEMO_ADMIN)}
          >
            👩‍🏫 Dr. Ananya Sharma (Admin)
          </button>
        </div>
      </section>

      {/* ====================================================================
          TAB 1: EVENTS MODULE
          ==================================================================== */}
      {activeTab === 'events' && (
        <section>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-top">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search events by title, description or venue..."
                  value={eventSearch}
                  onChange={(e) => {
                    setEventSearch(e.target.value);
                    fetchEvents(1, e.target.value, selectedCategory, selectedStatus);
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <select
                  className="select-filter"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    fetchEvents(1, eventSearch, selectedCategory, e.target.value);
                  }}
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming Only</option>
                  <option value="past">Past Events</option>
                </select>

                {user.role === 'admin' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEventFormData({ id: null, title: '', description: '', category: 'Workshop', date: '2026-11-20', time: '10:00 AM - 01:00 PM', venue: 'Block C Auditorium', maxSeats: 60 });
                      setShowEventModal(true);
                    }}
                  >
                    + Create Event
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="filter-pills">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '6px' }}>Category:</span>
              {['All', 'Workshop', 'Hackathon', 'Placement Drive', 'Seminar'].map((cat) => (
                <button
                  key={cat}
                  className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    fetchEvents(1, eventSearch, cat, selectedStatus);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {eventsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading upcoming campus events...
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
              <h3>No events matched your search query</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Try clearing filters or search keywords.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {events.map((ev) => {
                const fillPct = Math.min(100, Math.round((ev.registeredCount / ev.maxSeats) * 100));
                const isNearlyFull = ev.seatsLeft <= 5 && !ev.isFull;

                return (
                  <article key={ev.id} className="card">
                    <div className="card-header-meta">
                      <span className={`category-badge category-${ev.category.replace(/\s+/g, '_')}`}>
                        {ev.category}
                      </span>
                      {ev.isRegistered && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          ✔ Registered
                        </span>
                      )}
                    </div>

                    <h3 className="card-title">{ev.title}</h3>
                    <p className="card-desc">{ev.description}</p>

                    <div className="logistics-list">
                      <div className="logistics-item">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{ev.date} &bull; {ev.time}</span>
                      </div>
                      <div className="logistics-item">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{ev.venue}</span>
                      </div>
                    </div>

                    {/* Live Seat Availability */}
                    <div className="seat-availability">
                      <div className="seat-labels">
                        <span>Capacity: {ev.registeredCount} / {ev.maxSeats}</span>
                        <span className={`seats-remaining ${ev.isFull ? 'full' : isNearlyFull ? 'low' : ''}`}>
                          {ev.isFull ? '● Fully Booked' : `${ev.seatsLeft} Seats Left`}
                        </span>
                      </div>
                      <div className="seat-progress-track">
                        <div
                          className={`seat-progress-fill ${ev.isFull ? 'full' : ''}`}
                          style={{ width: `${fillPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="card-actions">
                      {user.role === 'student' ? (
                        ev.isRegistered ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUnregisterEvent(ev.id, ev.title)}
                          >
                            Cancel RSVP
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={ev.isFull}
                            onClick={() => handleRegisterEvent(ev.id, ev.title)}
                          >
                            {ev.isFull ? 'Event Full' : 'Register Now &rarr;'}
                          </button>
                        )
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewAttendees(ev.id)}
                        >
                          👥 View Roster ({ev.registeredCount})
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEventFormData({
                                id: ev.id,
                                title: ev.title,
                                description: ev.description,
                                category: ev.category,
                                date: ev.date,
                                time: ev.time,
                                venue: ev.venue,
                                maxSeats: ev.maxSeats
                              });
                              setShowEventModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="pagination">
            <div className="pagination-info">
              Showing page <strong>{eventsPage}</strong> of <strong>{eventsTotalPages}</strong> ({eventsTotal} total events)
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={eventsPage <= 1}
                onClick={() => {
                  const p = eventsPage - 1;
                  setEventsPage(p);
                  fetchEvents(p);
                }}
              >
                &larr; Prev
              </button>
              {Array.from({ length: eventsTotalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`page-btn ${eventsPage === num ? 'active' : ''}`}
                  onClick={() => {
                    setEventsPage(num);
                    fetchEvents(num);
                  }}
                >
                  {num}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={eventsPage >= eventsTotalPages}
                onClick={() => {
                  const p = eventsPage + 1;
                  setEventsPage(p);
                  fetchEvents(p);
                }}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          TAB 2: ACADEMIC RESOURCES MODULE
          ==================================================================== */}
      {activeTab === 'resources' && (
        <section>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-top">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search resources by title, subject or topic..."
                  value={resourceSearch}
                  onChange={(e) => {
                    setResourceSearch(e.target.value);
                    fetchResources(1, e.target.value, selectedSubject, selectedSemester, selectedFileType);
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <select
                  className="select-filter"
                  value={selectedFileType}
                  onChange={(e) => {
                    setSelectedFileType(e.target.value);
                    fetchResources(1, resourceSearch, selectedSubject, selectedSemester, e.target.value);
                  }}
                >
                  <option value="All">All Formats (PDF/DOCX)</option>
                  <option value="pdf">PDF Documents</option>
                  <option value="docx">Word (.docx) Docs</option>
                </select>

                {user.role === 'admin' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    + Upload Resource
                  </button>
                )}
              </div>
            </div>

            {/* Subject & Semester Filter Rows */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div className="filter-pills">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Subject:</span>
                {['All', 'Full Stack Development', 'Cloud Computing', 'Operating Systems', 'Data Structures & DBMS', 'Artificial Intelligence'].map((sub) => (
                  <button
                    key={sub}
                    className={`pill ${selectedSubject === sub ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSubject(sub);
                      fetchResources(1, resourceSearch, sub, selectedSemester, selectedFileType);
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <div className="filter-pills">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Semester:</span>
                {['All', 'Semester 5', 'Semester 6'].map((sem) => (
                  <button
                    key={sem}
                    className={`pill ${selectedSemester === sem ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSemester(sem);
                      fetchResources(1, resourceSearch, selectedSubject, sem, selectedFileType);
                    }}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Cards Grid */}
          {resourcesLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading academic documents...
            </div>
          ) : resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
              <h3>No academic resources found for this filter</h3>
            </div>
          ) : (
            <div className="cards-grid">
              {resources.map((resItem) => (
                <article key={resItem.id} className="card">
                  <div className="card-header-meta">
                    <span className={`file-badge ${resItem.fileType}`}>
                      {resItem.fileType} &bull; {resItem.fileSize}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      📥 {resItem.downloadCount} Downloads
                    </span>
                  </div>

                  <h3 className="card-title">{resItem.title}</h3>
                  <p className="card-desc">{resItem.description}</p>

                  <div className="logistics-list">
                    <div className="logistics-item">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                      <span>{resItem.subject} &bull; {resItem.semester}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownloadResource(resItem)}
                    >
                      📥 Download {resItem.fileType.toUpperCase()}
                    </button>

                    {user.role === 'admin' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          if (!window.confirm(`Delete resource "${resItem.title}"?`)) return;
                          const res = await apiFetch(`/api/resources/${resItem.id}`, { method: 'DELETE' });
                          if (res.ok) {
                            showToast('Resource deleted', 'success');
                            fetchResources();
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing page <strong>{resourcesPage}</strong> of <strong>{resourcesTotalPages}</strong> ({resourcesTotal} total resources)
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={resourcesPage <= 1}
                onClick={() => {
                  const p = resourcesPage - 1;
                  setResourcesPage(p);
                  fetchResources(p);
                }}
              >
                &larr; Prev
              </button>
              {Array.from({ length: resourcesTotalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`page-btn ${resourcesPage === num ? 'active' : ''}`}
                  onClick={() => {
                    setResourcesPage(num);
                    fetchResources(num);
                  }}
                >
                  {num}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={resourcesPage >= resourcesTotalPages}
                onClick={() => {
                  const p = resourcesPage + 1;
                  setResourcesPage(p);
                  fetchResources(p);
                }}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          TAB 3: STUDENT DASHBOARD
          ==================================================================== */}
      {activeTab === 'student-dash' && studentDash && (
        <section>
          {/* Stats Bar */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{studentDash.stats.totalRegistered}</div>
                <div className="stat-label">Total Events Enrolled</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emerald">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 14 14"></polyline>
                </svg>
              </div>
              <div>
                <div className="stat-value">{studentDash.stats.upcomingCount}</div>
                <div className="stat-label">Upcoming Sessions</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{studentDash.stats.resourcesAvailable}</div>
                <div className="stat-label">Course Materials Available</div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 800 }}>
            My Enrolled Events &amp; Registration History
          </h2>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Category</th>
                  <th>Date &amp; Time</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentDash.registrationHistory.map((reg) => (
                  <tr key={reg.id}>
                    <td><strong>{reg.title}</strong></td>
                    <td>
                      <span className={`category-badge category-${reg.category.replace(/\s+/g, '_')}`}>
                        {reg.category}
                      </span>
                    </td>
                    <td>{reg.date} &bull; {reg.time}</td>
                    <td>{reg.venue}</td>
                    <td>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                        ● Confirmed RSVP
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUnregisterEvent(reg.id, reg.title)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: '1.3rem', margin: '2rem 0 1rem', fontWeight: 800 }}>
            Recommended Course Materials ({user.semester})
          </h2>
          <div className="cards-grid">
            {studentDash.recommendedResources.map((resItem) => (
              <div key={resItem.id} className="card">
                <h4 style={{ color: '#ffffff', marginBottom: '0.4rem' }}>{resItem.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>{resItem.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`file-badge ${resItem.fileType}`}>{resItem.fileType} &bull; {resItem.fileSize}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleDownloadResource(resItem)}>
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          TAB 4: ADMIN ANALYTICS DASHBOARD
          ==================================================================== */}
      {activeTab === 'admin-dash' && adminDash && (
        <section>
          {/* Key Metric Indicators */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <div className="stat-value">{adminDash.stats.totalEvents}</div>
                <div className="stat-label">Total Events Scheduled</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{adminDash.stats.totalRegistrations}</div>
                <div className="stat-label">Student Registrations</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emerald">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <div className="stat-value">{adminDash.stats.totalResources}</div>
                <div className="stat-label">Academic Files Uploaded</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon amber">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 12l-4-4-4 4M12 16V8"></path>
                </svg>
              </div>
              <div>
                <div className="stat-value">{adminDash.stats.occupancyRate}%</div>
                <div className="stat-label">Campus Seat Occupancy</div>
              </div>
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffffff' }}>Category Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {adminDash.categoryStats.map((cat) => (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span><strong>{cat.category}</strong> ({cat.eventCount} Events)</span>
                      <span style={{ color: 'var(--accent-cyan)' }}>{cat.registrationCount} Registrations</span>
                    </div>
                    <div className="seat-progress-track">
                      <div
                        className="seat-progress-fill"
                        style={{ width: `${Math.min(100, (cat.registrationCount / Math.max(1, adminDash.stats.totalRegistrations)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top In-Demand Events */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffffff' }}>Highest Demand Events</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {adminDash.topEvents.map((topEv) => (
                  <div key={topEv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{topEv.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{topEv.category} &bull; {topEv.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                        {topEv.registeredCount} / {topEv.maxSeats}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{topEv.fillPercentage}% full</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Student Activity Table */}
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontWeight: 800 }}>Recent Student Registration Activity</h3>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Registered Event</th>
                  <th>Category</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {adminDash.recentActivity.map((act) => (
                  <tr key={act.id}>
                    <td><strong>{act.studentName}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{act.studentEmail}</td>
                    <td>{act.eventTitle}</td>
                    <td>
                      <span className={`category-badge category-${act.eventCategory.replace(/\s+/g, '_')}`}>
                        {act.eventCategory}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.registeredAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ====================================================================
          TAB 5: DATABASE INDEXING BENCHMARK (BONUS CHALLENGE)
          ==================================================================== */}
      {activeTab === 'indexing' && (
        <section>
          <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className="tag" style={{ background: 'rgba(56,189,248,0.2)', color: 'var(--accent-cyan)' }}>BONUS CHALLENGE</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.4rem', color: '#ffffff' }}>
                  Query Latency Optimization via B-Tree Indexing
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Benchmarking query performance across 10,000 synthetic records with and without composite indexing.
                </p>
              </div>
              <button
                className="btn btn-primary"
                disabled={benchmarkLoading}
                onClick={runBenchmark}
              >
                {benchmarkLoading ? 'Benchmarking...' : '⚡ Re-Run Live Benchmark'}
              </button>
            </div>

            {benchmarkData && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' }}>
                  {/* Before Card */}
                  <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase' }}>
                      1. Before Indexing (Full Table Scan)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fb7185', margin: '0.4rem 0' }}>
                      {benchmarkData.benchmark.beforeIndexing.executionTimeMs} ms
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      Strategy: {benchmarkData.benchmark.beforeIndexing.scanStrategy}
                    </div>
                    <code style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#020617', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>
                      {benchmarkData.benchmark.beforeIndexing.queryPlan}
                    </code>
                  </div>

                  {/* After Card */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                      2. After Indexing (B-Tree Seek)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', margin: '0.4rem 0' }}>
                      {benchmarkData.benchmark.afterIndexing.executionTimeMs} ms
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      Strategy: {benchmarkData.benchmark.afterIndexing.scanStrategy}
                    </div>
                    <code style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#020617', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>
                      {benchmarkData.benchmark.afterIndexing.queryPlan}
                    </code>
                  </div>

                  {/* Speedup Metric */}
                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                      Performance Multiplier
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.4rem 0' }}>
                      {benchmarkData.benchmark.speedupMultiplier}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {benchmarkData.benchmark.conclusion}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Target SQL Query:</strong>
                  <code style={{ color: 'var(--accent-cyan)', marginLeft: '8px' }}>
                    {benchmarkData.targetQuery}
                  </code>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ====================================================================
          TAB 6: ER DIAGRAM, ARCHITECTURE & API DOCS
          ==================================================================== */}
      {activeTab === 'docs' && (
        <section>
          {/* ER Diagram Card */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.8rem', color: '#ffffff' }}>
              Entity-Relationship (ER) Schema Model
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
              Relational representation connecting Users (Students/Faculty), Events, Registrations (Junction table with unique constraint), and Academic Resources.
            </p>

            <div style={{ background: '#020617', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: '1.6' }}>
              <pre style={{ color: '#38bdf8' }}>
{`+-----------------------------+         +-------------------------------+
|            USERS            |         |             EVENTS            |
+-----------------------------+         +-------------------------------+
| * id: INT (PK, AutoInc)     |1       *| * id: INT (PK, AutoInc)       |
|   name: VARCHAR(100)        |---------|   title: VARCHAR(150)         |
|   email: VARCHAR(120) UNIQUE|         |   description: TEXT           |
|   password: VARCHAR(255)    |         |   category: ENUM (Workshop...) |
|   role: ENUM(student,admin) |         |   date: DATE                  |
|   department: VARCHAR(100)  |         |   time: VARCHAR(50)           |
|   semester: VARCHAR(50)     |         |   venue: VARCHAR(100)         |
|   createdAt: TIMESTAMP      |         |   maxSeats: INT               |
+-----------------------------+         |   createdBy: INT (FK -> Users)|
              | 1                       +-------------------------------+
              |                                         | 1
              | *                                       | *
+-----------------------------+         +-------------------------------+
|          RESOURCES          |         |         REGISTRATIONS         |
+-----------------------------+         +-------------------------------+
| * id: INT (PK, AutoInc)     |         | * id: INT (PK, AutoInc)       |
|   title: VARCHAR(150)       |         | * eventId: INT (FK -> Events) |
|   subject: VARCHAR(100)     |         | * userId: INT (FK -> Users)   |
|   semester: VARCHAR(50)     |         |   registeredAt: TIMESTAMP     |
|   fileType: ENUM(pdf, docx) |         |   CONSTRAINT: UNIQUE(event,usr|
|   fileName: VARCHAR(200)    |         +-------------------------------+
|   filePath: VARCHAR(255)    |
|   downloadCount: INT        |
|   uploadedBy: INT (FK)      |
+-----------------------------+`}
              </pre>
            </div>
          </div>

          {/* API Endpoints Table */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Full RESTful API Documentation
              </h2>
              <a
                href="/postman_collection.json"
                download="postman_collection.json"
                className="btn btn-secondary btn-sm"
              >
                📥 Download Postman Collection
              </a>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Role Required</th>
                    <th>Status</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span style={{ color: '#38bdf8', fontWeight: 700 }}>POST</span></td>
                    <td><code>/api/auth/signup</code></td>
                    <td>Public</td>
                    <td>201 Created</td>
                    <td>Register student/admin with bcrypt hash and JWT issuance</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#38bdf8', fontWeight: 700 }}>POST</span></td>
                    <td><code>/api/auth/login</code></td>
                    <td>Public (Rate-limited)</td>
                    <td>200 OK / 429</td>
                    <td>Authenticate user, enforce 15 attempts / 15m rate limit</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#34d399', fontWeight: 700 }}>GET</span></td>
                    <td><code>/api/events</code></td>
                    <td>Public / Auth</td>
                    <td>200 OK</td>
                    <td>List events with search, category filtering &amp; pagination</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#38bdf8', fontWeight: 700 }}>POST</span></td>
                    <td><code>/api/events</code></td>
                    <td>Admin</td>
                    <td>201 / 403</td>
                    <td>Create new event with seat limit (RBAC enforced)</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#38bdf8', fontWeight: 700 }}>POST</span></td>
                    <td><code>/api/events/:id/register</code></td>
                    <td>Student</td>
                    <td>201 / 400 / 409</td>
                    <td>Student RSVP; prevents double-booking &amp; full capacity</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#38bdf8', fontWeight: 700 }}>POST</span></td>
                    <td><code>/api/events/:id/unregister</code></td>
                    <td>Student</td>
                    <td>200 OK</td>
                    <td>Cancel RSVP and increment vacant seat availability</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#34d399', fontWeight: 700 }}>GET</span></td>
                    <td><code>/api/events/:id/attendees</code></td>
                    <td>Admin</td>
                    <td>200 / 403</td>
                    <td>View full student roster per event with export ability</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#34d399', fontWeight: 700 }}>GET</span></td>
                    <td><code>/api/resources</code></td>
                    <td>Public</td>
                    <td>200 OK</td>
                    <td>Fetch resources categorized by subject &amp; semester</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#38bdf8', fontWeight: 700 }}>POST</span></td>
                    <td><code>/api/resources</code></td>
                    <td>Admin</td>
                    <td>201 Created</td>
                    <td>Upload academic documents (PDF &amp; DOCX files)</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#34d399', fontWeight: 700 }}>GET</span></td>
                    <td><code>/api/resources/:id/download</code></td>
                    <td>Public</td>
                    <td>200 OK</td>
                    <td>Stream binary document and increment download counter</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#34d399', fontWeight: 700 }}>GET</span></td>
                    <td><code>/api/dashboard/student</code></td>
                    <td>Student</td>
                    <td>200 OK</td>
                    <td>Student dashboard stats, history, and recommendations</td>
                  </tr>
                  <tr>
                    <td><span style={{ color: '#34d399', fontWeight: 700 }}>GET</span></td>
                    <td><code>/api/dashboard/admin</code></td>
                    <td>Admin</td>
                    <td>200 OK</td>
                    <td>Campus analytics, category metrics &amp; live student feed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          MODAL 1: AUTHENTICATION (LOGIN / SIGNUP)
          ==================================================================== */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{authMode === 'login' ? 'User Login' : 'Student / Faculty Registration'}</h3>
              <button className="btn-close" onClick={() => setShowAuthModal(false)}>&times;</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                className={`btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>
              <button
                className={`btn btn-sm ${authMode === 'signup' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setAuthMode('signup')}
              >
                Register New User
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
              const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authFormData)
              });
              const data = await res.json();
              if (res.ok) {
                setToken(data.token);
                setUser(data.user);
                setShowAuthModal(false);
                showToast(`Authenticated as ${data.user.name}`);
              } else {
                showToast(data.message || 'Authentication error', 'error');
              }
            }}>
              {authMode === 'signup' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Rahul Raj"
                      value={authFormData.name}
                      onChange={(e) => setAuthFormData({ ...authFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <select
                      className="form-select"
                      value={authFormData.role}
                      onChange={(e) => setAuthFormData({ ...authFormData, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="admin">Faculty / Admin</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="student@campus.edu"
                  value={authFormData.email}
                  onChange={(e) => setAuthFormData({ ...authFormData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="Min 6 characters"
                  value={authFormData.password}
                  onChange={(e) => setAuthFormData({ ...authFormData, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {authMode === 'login' ? 'Sign In &rarr;' : 'Create Account &rarr;'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: CREATE / EDIT EVENT (ADMIN)
          ==================================================================== */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{eventFormData.id ? 'Edit Event Details' : 'Create New Campus Event'}</h3>
              <button className="btn-close" onClick={() => setShowEventModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Next.js 15 Full-Stack Masterclass"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  required
                  placeholder="Describe event curriculum, prerequisites, and takeaway skills..."
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Seat Capacity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    required
                    value={eventFormData.maxSeats}
                    onChange={(e) => setEventFormData({ ...eventFormData, maxSeats: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="10:00 AM - 01:00 PM"
                    value={eventFormData.time}
                    onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue Location</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Auditorium Complex or Lab 404"
                  value={eventFormData.venue}
                  onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {eventFormData.id ? 'Save Updates' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: UPLOAD RESOURCE (ADMIN)
          ==================================================================== */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload &amp; Categorize Academic Resource</h3>
              <button className="btn-close" onClick={() => setShowUploadModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleUploadResource}>
              <div className="form-group">
                <label className="form-label">Resource Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Cloud Computing Unit 2 Docker Notes"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Summary</label>
                <textarea
                  className="form-textarea"
                  placeholder="Overview of lecture slides, question banks, or reference notes..."
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={uploadFormData.subject}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, subject: e.target.value })}
                  >
                    <option value="Full Stack Development">Full Stack Development</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Data Structures & DBMS">Data Structures &amp; DBMS</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Computer Networks">Computer Networks</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Semester</label>
                  <select
                    className="form-select"
                    value={uploadFormData.semester}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, semester: e.target.value })}
                  >
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Document Format</label>
                <select
                  className="form-select"
                  value={uploadFormData.fileType}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, fileType: e.target.value })}
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Microsoft Word (.docx)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: EVENT ATTENDEES ROSTER (ADMIN)
          ==================================================================== */}
      {showAttendeesModal && (
        <div className="modal-overlay" onClick={() => setShowAttendeesModal(false)}>
          <div className="modal-dialog large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Registered Students Roster</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Event: <strong>{currentAttendees.event.title}</strong> &bull; Total Attendees: <strong>{currentAttendees.attendees.length}</strong> / {currentAttendees.event.maxSeats}
                </p>
              </div>
              <button className="btn-close" onClick={() => setShowAttendeesModal(false)}>&times;</button>
            </div>

            {currentAttendees.attendees.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No students have registered for this event yet.
              </div>
            ) : (
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Email Address</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>RSVP Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAttendees.attendees.map((att, idx) => (
                      <tr key={att.id}>
                        <td>{idx + 1}</td>
                        <td><strong>{att.name}</strong></td>
                        <td>{att.email}</td>
                        <td>{att.department}</td>
                        <td>{att.semester}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{att.registeredAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowAttendeesModal(false)}>
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
