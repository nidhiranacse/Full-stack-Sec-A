import axios from 'axios'
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FilePlus2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Trash2,
  Upload,
  UsersRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const eventCategories = ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Tech Fest']
const resourceCategories = ['Notes', 'Previous Year Paper', 'Lab Manual', 'Reference Material']

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('campusconnect_user'))
  } catch {
    return null
  }
}

function request(method, path, token, data, options = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return axios({ method, url: `${API_URL}${path}`, data, headers, ...options })
}

function errorMessage(error) {
  const data = error.response?.data
  return data?.errors?.join(' ') || data?.message || 'The request could not be completed. Check that the API is running.'
}

function formatDate(value) {
  if (!value) return 'Date to be announced'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('campusconnect_token') || '')
  const [user, setUser] = useState(readStoredUser)
  const [view, setView] = useState('overview')
  const [dashboard, setDashboard] = useState(null)
  const [events, setEvents] = useState([])
  const [resources, setResources] = useState([])
  const [resourceMeta, setResourceMeta] = useState({ subjects: [], semesters: [] })
  const [pagination, setPagination] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState('')
  const [resourceCategory, setResourceCategory] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [authMode, setAuthMode] = useState('')
  const [eventDraft, setEventDraft] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        if (view === 'events') {
          const params = new URLSearchParams({ limit: '12', page: String(page) })
          if (search) params.set('search', search)
          if (category) params.set('category', category)
          const response = await request('get', `/events?${params}`, token)
          if (active) {
            setEvents(response.data.data.events)
            setPagination(response.data.data.pagination)
          }
        } else if (view === 'resources') {
          const params = new URLSearchParams({ limit: '12', page: String(page) })
          if (search) params.set('search', search)
          if (subject) params.set('subject', subject)
          if (semester) params.set('semester', semester)
          if (resourceCategory) params.set('category', resourceCategory)
          const response = await request('get', `/resources?${params}`, token)
          if (active) {
            setResources(response.data.data.resources)
            setResourceMeta(response.data.data.meta)
            setPagination(response.data.data.pagination)
          }
        } else if (token && user) {
          const endpoint = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'
          const response = await request('get', endpoint, token)
          if (active) setDashboard(response.data.data)
        } else {
          const response = await request('get', '/events?limit=4')
          if (active) setEvents(response.data.data.events)
        }
      } catch (requestError) {
        if (active) setError(errorMessage(requestError))
      } finally {
        if (active) setLoading(false)
      }
    }, 120)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [view, token, user, search, category, subject, semester, resourceCategory, page, refreshKey])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3600)
    return () => window.clearTimeout(timer)
  }, [notice])

  function changeView(nextView) {
    setSearch('')
    setCategory('')
    setSubject('')
    setSemester('')
    setResourceCategory('')
    setPage(1)
    setView(nextView)
  }

  function saveSession(session) {
    localStorage.setItem('campusconnect_token', session.token)
    localStorage.setItem('campusconnect_user', JSON.stringify(session.user))
    setToken(session.token)
    setUser(session.user)
    setAuthMode('')
    setNotice(`Welcome, ${session.user.name.split(' ')[0]}.`)
  }

  function signOut() {
    localStorage.removeItem('campusconnect_token')
    localStorage.removeItem('campusconnect_user')
    setToken('')
    setUser(null)
    setDashboard(null)
    setNotice('You have signed out.')
  }

  async function submitAuth(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values = Object.fromEntries(form.entries())
    try {
      const response = await request('post', `/auth/${authMode}`, '', values)
      saveSession(response.data.data)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  async function registerForEvent(eventId, isRegistered) {
    if (!token) {
      setAuthMode('login')
      return
    }
    try {
      const action = isRegistered ? 'unregister' : 'register'
      const response = await request('post', `/events/${eventId}/${action}`, token)
      setNotice(response.data.message)
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  async function deleteEvent(eventId) {
    if (!window.confirm('Delete this event and its registrations?')) return
    try {
      await request('delete', `/events/${eventId}`, token)
      setNotice('Event deleted.')
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  async function openEventEditor(event) {
    if (event.description) {
      setEventDraft(event)
      return
    }
    try {
      const response = await request('get', `/events/${event.id}`, token)
      setEventDraft(response.data.data)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  async function saveEvent(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const editId = eventDraft?.id
      const response = await request(editId ? 'put' : 'post', `/events${editId ? `/${editId}` : ''}`, token, values)
      setEventDraft(null)
      setNotice(response.data.message)
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  async function uploadResource(event) {
    event.preventDefault()
    const body = new FormData(event.currentTarget)
    try {
      const response = await request('post', '/resources', token, body)
      setUploadOpen(false)
      setNotice(response.data.message)
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  async function downloadResource(resource) {
    try {
      const response = await request('get', `/resources/${resource.id}/download`, token, undefined, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = resource.original_name
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  async function deleteResource(resourceId) {
    if (!window.confirm('Delete this study resource?')) return
    try {
      await request('delete', `/resources/${resourceId}`, token)
      setNotice('Resource deleted.')
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  const pageTitle = view === 'events' ? 'Campus events' : view === 'resources' ? 'Study library' : 'Your campus, in sync.'
  const pageDescription = view === 'events'
    ? 'Find your next workshop, seminar, or big idea.'
    : view === 'resources'
      ? 'Useful notes and course material, shared by your community.'
      : user ? `Good to see you, ${user.name.split(' ')[0]}. Here is what is happening.` : 'A better way to find your people, your events, and your next great resource.'

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#overview" onClick={() => changeView('overview')} aria-label="CampusConnect home">
          <span className="brand-mark"><GraduationCap size={21} strokeWidth={2.2} /></span>
          <span>campus<span className="brand-accent">connect</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'overview' ? 'nav-link active' : 'nav-link'} onClick={() => changeView('overview')}><LayoutDashboard size={16} /> Overview</button>
          <button className={view === 'events' ? 'nav-link active' : 'nav-link'} onClick={() => changeView('events')}><CalendarDays size={16} /> Events</button>
          <button className={view === 'resources' ? 'nav-link active' : 'nav-link'} onClick={() => changeView('resources')}><BookOpen size={16} /> Resources</button>
        </nav>
        <div className="account-area">
          {user ? (
            <>
              <span className="account-name"><span className="avatar">{user.name.charAt(0)}</span><span>{user.name.split(' ')[0]}<small>{user.role}</small></span></span>
              <button className="icon-button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button>
            </>
          ) : <button className="button button-dark button-small" onClick={() => setAuthMode('login')}><CircleUserRound size={16} /> Sign in</button>}
        </div>
      </header>

      <main className="page-wrap">
        <section className="page-heading">
          <div>
            <div className="eyebrow"><span className="live-dot" /> CAMPUSCONNECT / {view.toUpperCase()}</div>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>
          {user?.role === 'admin' && view === 'events' && <button className="button button-green" onClick={() => setEventDraft({})}><Plus size={17} /> New event</button>}
          {user && view === 'resources' && <button className="button button-green" onClick={() => setUploadOpen(true)}><Upload size={17} /> Share a resource</button>}
        </section>

        {notice && <div className="toast success-toast"><Check size={16} /> {notice}<button className="toast-close" onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
        {error && <div className="toast error-toast" role="alert">{error}<button className="toast-close" onClick={() => setError('')} aria-label="Dismiss"><X size={15} /></button></div>}

        {view === 'overview' && (
          <Overview
            user={user}
            dashboard={dashboard}
            events={events}
            loading={loading}
            onNavigate={changeView}
            onAuth={() => setAuthMode('login')}
            onEditEvent={openEventEditor}
            onDeleteEvent={deleteEvent}
            onRegister={registerForEvent}
          />
        )}

        {view === 'events' && (
          <>
            <div className="filter-bar">
              <label className="search-field"><Search size={18} /><input aria-label="Search events" placeholder="Search events, places, ideas..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} /></label>
              <label className="select-field"><span>TYPE</span><select value={category} onChange={(event) => { setPage(1); setCategory(event.target.value) }}><option value="">All events</option>{eventCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <div className="section-head"><div><span className="section-kicker">WHAT'S ON</span><h2>Find your next thing</h2></div><span className="result-count">{pagination?.totalItems ?? 0} events</span></div>
            {loading ? <LoadingState /> : events.length ? <div className="event-grid">{events.map((item) => <EventCard key={item.id} event={item} user={user} onRegister={registerForEvent} onEdit={setEventDraft} onDelete={deleteEvent} />)}</div> : <EmptyState title="No events found" message="Try another search or clear your filters." />}
            {pagination && pagination.totalPages > 1 && <div className="pagination"><button className="icon-button" disabled={!pagination.hasPrevPage} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><ChevronLeft size={18} /></button><span>Page {pagination.currentPage} of {pagination.totalPages}</span><button className="icon-button" disabled={!pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight size={18} /></button></div>}
          </>
        )}

        {view === 'resources' && (
          <>
            <div className="filter-bar resource-filter-bar">
              <label className="search-field"><Search size={18} /><input aria-label="Search resources" placeholder="Search subjects, notes, papers..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} /></label>
              <label className="select-field"><span>SUBJECT</span><select value={subject} onChange={(event) => { setPage(1); setSubject(event.target.value) }}><option value="">All subjects</option>{resourceMeta.subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="select-field"><span>SEMESTER</span><select value={semester} onChange={(event) => { setPage(1); setSemester(event.target.value) }}><option value="">All semesters</option>{resourceMeta.semesters.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="select-field"><span>FORMAT</span><select value={resourceCategory} onChange={(event) => { setPage(1); setResourceCategory(event.target.value) }}><option value="">All formats</option>{resourceCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
            <div className="section-head"><div><span className="section-kicker">THE STUDY SHELF</span><h2>Made to be passed around</h2></div><span className="result-count">{pagination?.totalItems ?? 0} resources</span></div>
            {loading ? <LoadingState /> : resources.length ? <div className="resource-list">{resources.map((resource) => <ResourceRow key={resource.id} resource={resource} user={user} onDownload={downloadResource} onDelete={deleteResource} />)}</div> : <EmptyState title="Nothing on this shelf yet" message="Try a different filter or share the first resource." />}
            {pagination && pagination.totalPages > 1 && <div className="pagination"><button className="icon-button" disabled={!pagination.hasPrevPage} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><ChevronLeft size={18} /></button><span>Page {pagination.currentPage} of {pagination.totalPages}</span><button className="icon-button" disabled={!pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight size={18} /></button></div>}
          </>
        )}

        <footer className="footer"><span><span className="brand-dot" /> A little more connected.</span><span>CampusConnect <span className="footer-year">2026</span></span></footer>
      </main>

      {authMode && <Modal title={authMode === 'login' ? 'Welcome back' : 'Join your campus'} onClose={() => { setAuthMode(''); setError('') }}>
        <p className="modal-intro">{authMode === 'login' ? 'Sign in to manage events, registrations, and shared resources.' : 'Create a student account to join events and share study material.'}</p>
        <form className="form-stack" onSubmit={submitAuth}>
          {authMode === 'register' && <Field label="Your name" name="name" placeholder="Full name" required minLength="2" />}
          <Field label="Campus email" name="email" type="email" placeholder="you@campus.edu" required />
          <Field label="Password" name="password" type="password" placeholder="At least 6 characters" required minLength="6" />
          {authMode === 'register' && <><Field label="Department" name="department" placeholder="Computer Science" /><label className="form-field"><span>Semester</span><select name="semester" defaultValue="6th Sem">{Array.from({ length: 8 }, (_, index) => <option key={index + 1}>{`${index + 1}${['st', 'nd', 'rd'][index] || 'th'} Sem`}</option>)}</select></label></>}
          <button className="button button-green form-submit" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button>
        </form>
        <p className="switch-auth">{authMode === 'login' ? 'New around here?' : 'Already have an account?'} <button onClick={() => { setError(''); setAuthMode(authMode === 'login' ? 'register' : 'login') }}>{authMode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
      </Modal>}

      {eventDraft && <Modal title={eventDraft.id ? 'Edit event' : 'Create an event'} onClose={() => setEventDraft(null)}>
        <form className="form-stack" onSubmit={saveEvent}>
          <Field label="Event title" name="title" defaultValue={eventDraft.title} required minLength="3" />
          <label className="form-field"><span>Description</span><textarea name="description" defaultValue={eventDraft.description} required minLength="10" rows="3" /></label>
          <label className="form-field"><span>Category</span><select name="category" defaultValue={eventDraft.category || eventCategories[0]}>{eventCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="form-row"><Field label="Date" name="date" type="date" defaultValue={eventDraft.date} required /><Field label="Time" name="time" placeholder="10:00 AM - 12:00 PM" defaultValue={eventDraft.time} required /></div>
          <div className="form-row"><Field label="Venue" name="venue" defaultValue={eventDraft.venue} required /><Field label="Seats" name="total_seats" type="number" min="1" defaultValue={eventDraft.total_seats || 30} required /></div>
          <button className="button button-green form-submit" type="submit">{eventDraft.id ? 'Save changes' : 'Publish event'} <ArrowRight size={17} /></button>
        </form>
      </Modal>}

      {uploadOpen && <Modal title="Share a resource" onClose={() => setUploadOpen(false)}>
        <p className="modal-intro">Pass along notes, lab manuals, or papers for your classmates.</p>
        <form className="form-stack" onSubmit={uploadResource}>
          <Field label="Title" name="title" placeholder="e.g. Database normalization notes" required minLength="3" />
          <div className="form-row"><Field label="Subject" name="subject" placeholder="Database Systems" required minLength="2" /><label className="form-field"><span>Semester</span><select name="semester" defaultValue={user?.semester || '6th Sem'}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1}>{`${index + 1}${['st', 'nd', 'rd'][index] || 'th'} Sem`}</option>)}</select></label></div>
          <label className="form-field"><span>Resource type</span><select name="category" defaultValue={resourceCategories[0]}>{resourceCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="form-field"><span>Description <small>Optional</small></span><textarea name="description" rows="2" /></label>
          <label className="file-picker"><FilePlus2 size={20} /><span>Choose a PDF or DOCX file</span><input name="file" type="file" accept=".pdf,.doc,.docx" required /></label>
          <button className="button button-green form-submit" type="submit">Upload resource <Upload size={16} /></button>
        </form>
      </Modal>}
    </div>
  )
}

function Overview({ user, dashboard, events, loading, onNavigate, onAuth, onEditEvent, onDeleteEvent, onRegister }) {
  if (loading) return <LoadingState />
  if (user?.role === 'admin' && dashboard) {
    const metrics = [
      { label: 'Campus events', value: dashboard.analytics.total_events, icon: CalendarDays },
      { label: 'Student registrations', value: dashboard.analytics.total_registrations, icon: UsersRound },
      { label: 'Shared resources', value: dashboard.analytics.total_resources, icon: BookOpen },
      { label: 'Active students', value: dashboard.analytics.total_students, icon: GraduationCap },
    ]
    return <>
      <div className="welcome-strip"><div className="welcome-icon"><ShieldCheck size={22} /></div><div><strong>Administrator overview</strong><span>Campus activity at a glance.</span></div><span className="role-pill">ADMIN</span></div>
      <div className="metric-grid">{metrics.map(({ label, value, icon: Icon }, index) => <div className={`metric metric-${index + 1}`} key={label}><span className="metric-icon"><Icon size={18} /></span><span className="metric-value">{value}</span><span className="metric-label">{label}</span></div>)}</div>
      <div className="section-head dashboard-section-head"><div><span className="section-kicker">UP NEXT</span><h2>Coming up on campus</h2></div><button className="text-link" onClick={() => onNavigate('events')}>Manage events <ArrowRight size={15} /></button></div>
      <div className="event-grid">{dashboard.event_breakdown.slice(0, 3).map((item) => <EventCard key={item.id} event={{ ...item, available_seats: item.remaining_seats, registered_count: item.registered_students }} user={user} onEdit={onEditEvent} onDelete={onDeleteEvent} />)}</div>
      <div className="admin-bottom"><div><span className="section-kicker">COMMUNITY</span><h2>Recent registrations</h2></div><div className="registration-list">{dashboard.recent_registrations.slice(0, 4).map((item) => <div className="registration-row" key={item.registration_id}><span className="avatar avatar-small">{item.student_name.charAt(0)}</span><span><strong>{item.student_name}</strong><small>{item.event_title}</small></span><span className="registration-date">{formatDate(item.registered_at?.slice(0, 10))}</span></div>)}</div></div>
    </>
  }
  if (user && dashboard) {
    return <>
      <div className="welcome-strip"><div className="welcome-icon"><Sparkles size={22} /></div><div><strong>Your semester, a little more organized.</strong><span>{user.department || 'Campus community'} / {user.semester || 'Student'}</span></div><span className="role-pill">STUDENT</span></div>
      <div className="metric-grid student-metrics"><div className="metric metric-1"><span className="metric-icon"><TicketCheck size={18} /></span><span className="metric-value">{dashboard.summary.total_registered}</span><span className="metric-label">Events joined</span></div><div className="metric metric-2"><span className="metric-icon"><CalendarDays size={18} /></span><span className="metric-value">{dashboard.summary.upcoming_count}</span><span className="metric-label">Coming up</span></div><div className="metric metric-3"><span className="metric-icon"><BookOpen size={18} /></span><span className="metric-value">{dashboard.summary.semester_resources_count}</span><span className="metric-label">Relevant resources</span></div></div>
      <div className="section-head dashboard-section-head"><div><span className="section-kicker">YOUR CALENDAR</span><h2>Events you joined</h2></div><button className="text-link" onClick={() => onNavigate('events')}>Explore events <ArrowRight size={15} /></button></div>
      {dashboard.my_events.length ? <div className="event-grid">{dashboard.my_events.slice(0, 3).map((item) => <EventCard key={item.id} event={{ ...item, is_registered: true }} user={user} onRegister={onRegister} />)}</div> : <EmptyState title="Your calendar is open" message="Find an event that sounds like you and save your seat." action="Browse events" onAction={() => onNavigate('events')} />}
      <div className="resource-callout"><div className="resource-callout-icon"><BookOpen size={23} /></div><div><span className="section-kicker">STUDY TOGETHER</span><h2>Good notes travel far.</h2><p>Find shared course material or add something useful to the shelf.</p></div><button className="button button-dark" onClick={() => onNavigate('resources')}>Open library <ArrowRight size={16} /></button></div>
    </>
  }
  return <>
    <div className="intro-band"><div className="intro-copy"><span className="section-kicker">MAKE THIS PLACE YOURS</span><h2>Find a room full of ideas.</h2><p>From hands-on workshops to exam-week notes, the good stuff is happening all around you.</p><button className="button button-dark" onClick={onAuth}>Get started <ArrowRight size={16} /></button></div><div className="intro-illustration" aria-hidden="true"><div className="sun-disc" /><div className="campus-building"><span /><span /><span /><span /></div><div className="book-stack"><i /><i /><i /></div><span className="illustration-label">CAMPUS / 2026</span></div></div>
    <div className="section-head dashboard-section-head"><div><span className="section-kicker">MARK YOUR CALENDAR</span><h2>Coming up on campus</h2></div><button className="text-link" onClick={() => onNavigate('events')}>All events <ArrowRight size={15} /></button></div>
    {events.length ? <div className="event-grid">{events.slice(0, 3).map((item) => <EventCard key={item.id} event={item} user={user} onRegister={onRegister} />)}</div> : <EmptyState title="No upcoming events yet" message="Check back soon for what is happening on campus." />}
    <div className="feature-links"><button onClick={() => onNavigate('events')}><span><CalendarDays size={19} /></span><strong>Find your people</strong><small>Workshops, talks, and campus events</small><ArrowRight size={17} /></button><button onClick={() => onNavigate('resources')}><span><BookOpen size={19} /></span><strong>Share the good notes</strong><small>Useful resources from your classmates</small><ArrowRight size={17} /></button></div>
  </>
}

function EventCard({ event, user, onRegister, onEdit, onDelete }) {
  const isPast = event.event_status === 'completed'
  const occupancy = event.total_seats ? Math.min(100, Math.round((event.registered_count / event.total_seats) * 100)) : 0
  return <article className="event-card">
    <div className={`event-ribbon ribbon-${(event.category || 'event').toLowerCase().replaceAll(' ', '-')}`}><span>{event.category}</span><span className="event-date-top">{formatDate(event.date)}</span></div>
    <div className="event-card-body"><div className="event-card-title"><h3>{event.title}</h3>{user?.role === 'admin' && <div className="card-actions"><button className="icon-button" title="Edit event" aria-label="Edit event" onClick={() => onEdit(event)}><FileText size={16} /></button><button className="icon-button danger-icon" title="Delete event" aria-label="Delete event" onClick={() => onDelete(event.id)}><Trash2 size={16} /></button></div>}</div>
      <p className="event-description">{event.description || 'Join the campus community for this event.'}</p>
      <div className="event-facts"><span><Clock3 size={15} />{event.time || 'Time TBA'}</span><span><MapPin size={15} />{event.venue || 'Venue TBA'}</span></div>
      <div className="event-capacity"><span>{event.available_seats ?? event.remaining_seats ?? 0} seats left</span><div className="capacity-track"><span style={{ width: `${occupancy}%` }} /></div></div>
      <div className="event-card-footer"><span className="attendee-count"><UsersRound size={15} /> {event.registered_count ?? event.registered_students ?? 0} attending</span>{user?.role === 'student' ? <button className={event.is_registered ? 'button button-outline button-small' : 'button button-green button-small'} disabled={isPast || (!event.is_registered && event.available_seats <= 0)} onClick={() => onRegister(event.id, event.is_registered)}>{event.is_registered ? 'Cancel seat' : isPast ? 'Event ended' : 'Join event'}</button> : !user && onRegister ? <button className="button button-outline button-small" onClick={() => onRegister(event.id, false)}>Sign in to join</button> : null}</div>
    </div>
  </article>
}

function ResourceRow({ resource, user, onDownload, onDelete }) {
  const canDelete = user && (user.role === 'admin' || user.id === resource.uploaded_by)
  return <article className="resource-row"><div className="file-icon"><FileText size={21} /></div><div className="resource-info"><div className="resource-title-line"><h3>{resource.title}</h3><span className="resource-type">{resource.category}</span></div><p>{resource.description || `${resource.subject} / ${resource.semester}`}</p><div className="resource-meta"><span>{resource.subject}</span><span>{resource.semester}</span><span>Added by {resource.uploader_name || 'Campus community'}</span></div></div><div className="resource-actions"><span className="download-count"><ArrowDownToLine size={14} /> {resource.download_count || 0}</span><button className="button button-outline button-small" onClick={() => onDownload(resource)}><ArrowDownToLine size={15} /> Download</button>{canDelete && <button className="icon-button danger-icon" onClick={() => onDelete(resource.id)} aria-label="Delete resource" title="Delete resource"><Trash2 size={16} /></button>}</div></article>
}

function Field({ label, ...props }) {
  return <label className="form-field"><span>{label}</span><input {...props} /></label>
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="section-kicker">CAMPUSCONNECT</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</section></div>
}

function LoadingState() {
  return <div className="loading-state"><span className="loading-mark" /><span>Getting things ready</span></div>
}

function EmptyState({ title, message, action, onAction }) {
  return <div className="empty-state"><span className="empty-icon"><Sparkles size={21} /></span><h3>{title}</h3><p>{message}</p>{action && <button className="text-link" onClick={onAction}>{action} <ArrowRight size={15} /></button>}</div>
}

export default App
