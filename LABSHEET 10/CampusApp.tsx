import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronLeft,
  ChevronRight, Clock3, FileText, GraduationCap, LayoutDashboard, LogIn, LogOut, MapPin,
  Menu, Plus, Search, Sparkles, Ticket, Trash2, Upload, Users, X,
} from 'lucide-react'
import './Campus.css'

type Role = 'student' | 'admin'
type View = 'discover' | 'registrations' | 'resources' | 'studio'
type Person = { id: number; name: string; email: string; role: Role }
type CampusEvent = {
  id: number; title: string; description: string; category: string; starts_at: string
  starts_time: string; venue: string; capacity: number; cover_url: string; registration_count: number
}
type CampusResource = {
  id: number; title: string; subject: string; semester: string; description: string
  file_name: string | null; created_at: string
}
type ModalState = 'login' | 'signup' | 'event' | 'event-form' | 'resource-form' | 'attendees' | null

const categories = ['All events', 'Workshop', 'Hackathon', 'Career', 'Community']
const subjects = ['All subjects', 'Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks']

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem('cc-token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`/api${path}`, { ...options, headers })
  const body = response.status === 204 ? undefined : await response.json()
  if (!response.ok) throw new Error(body?.error || 'Something went wrong. Please try again.')
  return body as T
}

function dateParts(date: string) {
  const value = new Date(`${date}T12:00:00`)
  return {
    day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(value),
    month: new Intl.DateTimeFormat('en', { month: 'short' }).format(value),
    full: new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(value),
  }
}

function CampusApp() {
  const [token, setToken] = useState(() => localStorage.getItem('cc-token') || '')
  const [user, setUser] = useState<Person | null>(null)
  const [view, setView] = useState<View>('discover')
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [resources, setResources] = useState<CampusResource[]>([])
  const [registrations, setRegistrations] = useState<CampusEvent[]>([])
  const [analytics, setAnalytics] = useState({ totalEvents: 0, totalRegistrations: 0, totalStudents: 0 })
  const [eventTotal, setEventTotal] = useState(0)
  const [eventPages, setEventPages] = useState(1)
  const [resourceTotal, setResourceTotal] = useState(0)
  const [resourcePages, setResourcePages] = useState(1)
  const [eventPage, setEventPage] = useState(1)
  const [resourcePage, setResourcePage] = useState(1)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [resourceSearch, setResourceSearch] = useState('')
  const [category, setCategory] = useState('All events')
  const [subject, setSubject] = useState('All subjects')
  const [semester, setSemester] = useState('All semesters')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null)
  const [attendees, setAttendees] = useState<{ name: string; email: string; registered_at: string }[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: String(eventPage), limit: '6' })
        if (search.trim()) params.set('search', search.trim())
        if (category !== 'All events') params.set('category', category)
        if (dateFrom) params.set('dateFrom', dateFrom)
        if (dateTo) params.set('dateTo', dateTo)
        const result = await api<{ events: CampusEvent[]; total: number; pages: number }>(`/events?${params}`)
        if (active) {
          setEvents(result.events); setEventTotal(result.total); setEventPages(Math.max(1, result.pages)); setError('')
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not load events.')
      } finally { if (active) setLoading(false) }
    }, 120)
    return () => { active = false; window.clearTimeout(timer) }
  }, [eventPage, search, category, dateFrom, dateTo])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ page: String(resourcePage), limit: '8' })
        if (resourceSearch.trim()) params.set('search', resourceSearch.trim())
        if (subject !== 'All subjects') params.set('subject', subject)
        if (semester !== 'All semesters') params.set('semester', semester)
        const result = await api<{ resources: CampusResource[]; total: number; pages: number }>(`/resources?${params}`)
        if (active) {
          setResources(result.resources); setResourceTotal(result.total); setResourcePages(Math.max(1, result.pages))
        }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'Could not load resources.') }
    }, 100)
    return () => { active = false; window.clearTimeout(timer) }
  }, [resourcePage, resourceSearch, subject, semester])

  useEffect(() => {
    let active = true
    if (token) {
      api<{ user: Person }>('/auth/me')
        .then(({ user: currentUser }) => { if (active) setUser(currentUser) })
        .catch(() => {
          if (active) { localStorage.removeItem('cc-token'); setToken(''); setUser(null); setRegistrations([]) }
        })
    }
    return () => { active = false }
  }, [token])

  useEffect(() => {
    if (!user || user.role !== 'student') return
    api<{ registrations: CampusEvent[] }>('/registrations/mine')
      .then((result) => setRegistrations(result.registrations))
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load your registrations.'))
  }, [user, notice])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    api<typeof analytics>('/admin/analytics')
      .then(setAnalytics)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load admin analytics.'))
  }, [user, notice, eventTotal])

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }
  const changeView = (next: View) => { setView(next); setMenuOpen(false); setError('') }

  async function refreshEvents(page = eventPage) {
    const params = new URLSearchParams({ page: String(page), limit: '6' })
    if (search.trim()) params.set('search', search.trim())
    if (category !== 'All events') params.set('category', category)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    const result = await api<{ events: CampusEvent[]; total: number; pages: number }>(`/events?${params}`)
    const targetPage = Math.min(page, Math.max(1, result.pages))
    if (targetPage !== page) return refreshEvents(targetPage)
    setEvents(result.events); setEventTotal(result.total); setEventPages(Math.max(1, result.pages)); setEventPage(targetPage)
  }

  async function refreshResources(page = resourcePage) {
    const params = new URLSearchParams({ page: String(page), limit: '8' })
    if (resourceSearch.trim()) params.set('search', resourceSearch.trim())
    if (subject !== 'All subjects') params.set('subject', subject)
    if (semester !== 'All semesters') params.set('semester', semester)
    const result = await api<{ resources: CampusResource[]; total: number; pages: number }>(`/resources?${params}`)
    const targetPage = Math.min(page, Math.max(1, result.pages))
    if (targetPage !== page) return refreshResources(targetPage)
    setResources(result.resources); setResourceTotal(result.total); setResourcePages(Math.max(1, result.pages)); setResourcePage(targetPage)
  }

  async function authenticate(event: FormEvent<HTMLFormElement>, mode: 'login' | 'signup') {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    setError('')
    try {
      const result = await api<{ token: string; user: Person }>(`/auth/${mode === 'signup' ? 'signup' : 'login'}`, { method: 'POST', body: JSON.stringify(values) })
      localStorage.setItem('cc-token', result.token); setToken(result.token); setUser(result.user); setModal(null)
      showNotice(`Welcome in, ${result.user.name.split(' ')[0]}.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not sign in.') }
  }

  async function demoLogin(role: Role) {
    const credentials = role === 'admin' ? { email: 'admin@campus.edu', password: 'Admin123!' } : { email: 'student@campus.edu', password: 'Student123!' }
    setError('')
    try {
      const result = await api<{ token: string; user: Person }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
      localStorage.setItem('cc-token', result.token); setToken(result.token); setUser(result.user); setModal(null)
      showNotice(`Signed in to the ${role} demo.`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not sign in.') }
  }

  function signOut() {
    localStorage.removeItem('cc-token'); setToken(''); setUser(null); setRegistrations([]); setView('discover'); showNotice('You have signed out.')
  }

  async function toggleRegistration(eventItem: CampusEvent) {
    if (!user) { setSelectedEvent(eventItem); setModal('login'); return }
    if (user.role !== 'student') { showNotice('Switch to a student account to register for events.'); return }
    const registered = registrations.some((item) => item.id === eventItem.id)
    try {
      await api(`/events/${eventItem.id}/register`, { method: registered ? 'DELETE' : 'POST' })
      showNotice(registered ? 'Registration removed.' : 'You are on the list. See you there!')
      const [, history] = await Promise.all([
        refreshEvents(eventPage),
        api<{ registrations: CampusEvent[] }>('/registrations/mine'),
      ])
      setRegistrations(history.registrations)
    } catch (cause) { showNotice(cause instanceof Error ? cause.message : 'Could not update registration.') }
  }

  async function saveEvent(values: Record<string, FormDataEntryValue>) {
    const payload = {
      title: values.title, description: values.description, category: values.category,
      startsAt: values.startsAt, startsTime: values.startsTime, venue: values.venue,
      capacity: Number(values.capacity), coverUrl: values.coverUrl,
    }
    try {
      await api(editingEvent ? `/events/${editingEvent.id}` : '/events', { method: editingEvent ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setModal(null); setEditingEvent(null); await refreshEvents(1); showNotice(editingEvent ? 'Event updated.' : 'Event added to the calendar.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save event.') }
  }

  async function uploadResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await api('/resources', { method: 'POST', body: new FormData(event.currentTarget) })
      setModal(null); await refreshResources(1); showNotice('Resource added to the library.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not upload resource.') }
  }

  async function deleteEvent(item: CampusEvent) {
    if (!window.confirm(`Delete “${item.title}”? Existing registrations will be removed.`)) return
    try { await api(`/events/${item.id}`, { method: 'DELETE' }); await refreshEvents(1); showNotice('Event deleted.') }
    catch (cause) { showNotice(cause instanceof Error ? cause.message : 'Could not delete event.') }
  }

  async function showAttendees(item: CampusEvent) {
    setSelectedEvent(item)
    try {
      const result = await api<{ registrations: typeof attendees }>(`/events/${item.id}/registrations`)
      setAttendees(result.registrations); setModal('attendees')
    } catch (cause) { showNotice(cause instanceof Error ? cause.message : 'Could not load attendees.') }
  }

  async function deleteResource(item: CampusResource) {
    if (!window.confirm(`Remove “${item.title}” from the library?`)) return
    try {
      await api(`/resources/${item.id}`, { method: 'DELETE' })
      await refreshResources(resourcePage); showNotice('Resource removed.')
    } catch (cause) { showNotice(cause instanceof Error ? cause.message : 'Could not remove resource.') }
  }

  const navigation: { id: View; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
    { id: 'discover', label: 'Discover', icon: LayoutDashboard },
    ...(user?.role === 'student' ? [{ id: 'registrations' as const, label: 'My registrations', icon: Ticket, badge: registrations.length ? String(registrations.length) : undefined }] : []),
    { id: 'resources', label: 'Resource library', icon: BookOpen },
    ...(user?.role === 'admin' ? [{ id: 'studio' as const, label: 'Admin studio', icon: Sparkles }] : []),
  ]
  const activeTitle = view === 'discover' ? 'Discover' : view === 'registrations' ? 'My registrations' : view === 'resources' ? 'Resource library' : 'Admin studio'

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#discover" onClick={() => changeView('discover')}><span className="brand-mark"><GraduationCap size={21} /></span><span>campus<span className="brand-light">connect</span><small>YOUR CAMPUS, IN SYNC</small></span></a>
      <div className="side-label">YOUR SPACE</div>
      <nav className="side-nav" aria-label="Main navigation">{navigation.map((item) => {
        const Icon = item.icon
        return <button key={item.id} className={`nav-item ${view === item.id ? 'nav-active' : ''}`} onClick={() => changeView(item.id)}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</button>
      })}</nav>
      <div className="sidebar-note"><span className="note-stamp"><Sparkles size={15} /></span><strong>Good things happen<br />when we show up.</strong><span>Find your people. Learn a little. Do a lot.</span><span className="note-doodle" aria-hidden="true">✳</span></div>
      <div className="profile-slot">{user ? <><div className="avatar">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div><div className="profile-copy"><strong>{user.name}</strong><span>{user.role === 'admin' ? 'Campus admin' : 'Student account'}</span></div><button className="icon-button profile-action" aria-label="Sign out" title="Sign out" onClick={signOut}><LogOut size={17} /></button></> : <><div className="avatar avatar-guest"><GraduationCap size={18} /></div><div className="profile-copy"><strong>Welcome to campus</strong><span>Sign in to join in</span></div><button className="icon-button profile-action" aria-label="Sign in" title="Sign in" onClick={() => setModal('login')}><LogIn size={17} /></button></>}</div>
    </aside>

    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenuOpen((open) => !open)}><Menu size={20} /></button><div className="crumb"><span>CampusConnect</span><ArrowRight size={13} /><strong>{activeTitle}</strong></div><div className="topbar-right"><span className="today"><CalendarDays size={15} /> Thursday, October 01</span>{!user && <button className="button button-dark top-signin" onClick={() => setModal('login')}>Sign in <ArrowUpRight size={15} /></button>}{user?.role === 'admin' && <span className="role-chip"><span /> ADMIN</span>}</div></header>
      <div className="page-wrap">
        {notice && <div className="toast" role="status"><Check size={17} />{notice}<button className="icon-button" aria-label="Dismiss" onClick={() => setNotice('')}><X size={15} /></button></div>}
        {error && <div className="inline-error" role="alert">{error}<button className="icon-button" aria-label="Dismiss error" onClick={() => setError('')}><X size={15} /></button></div>}

        {view === 'discover' && <>
          <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-star">✳</span> A LITTLE MORE CAMPUS, EVERY DAY</div><h1>{user ? `Good to see you, ${user.name.split(' ')[0]}.` : 'Make room for what’s next.'}</h1><p className="welcome-sub">Find your next idea, your next team, your next reason to stay a little longer.</p></div><button className="date-card" onClick={() => { setCategory('All events'); setSearch('') }} aria-label="Clear filters and view upcoming events"><span>OCT</span><strong>01</strong><small>THURSDAY</small></button></section>
          <section className="feature-banner" aria-label="Featured campus event"><div className="feature-copy"><span className="feature-kicker"><span /> THIS WEEK ON CAMPUS</span><h2>Ideas are better<br />when built together.</h2><p>Find a workshop, a challenge, or just a new corner of campus to explore.</p><button className="feature-link" onClick={() => document.getElementById('event-list')?.scrollIntoView({ behavior: 'smooth' })}>See what’s on <ArrowRight size={16} /></button></div><div className="feature-image"><img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=85" alt="Students sharing ideas around a campus table" /><span className="image-caption">BETTER, TOGETHER <span>↗</span></span></div><span className="banner-mark" aria-hidden="true">✳</span></section>
          <section className="quick-stats" aria-label="Campus at a glance"><div><span className="stat-icon stat-peach"><CalendarDays size={17} /></span><span><strong>{eventTotal}</strong><small>upcoming events</small></span></div><i /><div><span className="stat-icon stat-green"><Users size={17} /></span><span><strong>{events.reduce((total, item) => total + Math.max(0, item.capacity - item.registration_count), 0)}</strong><small>seats in this view</small></span></div><i /><button className="stat-resource" onClick={() => changeView('resources')}><span className="stat-icon stat-yellow"><BookOpen size={17} /></span><span><strong>{resourceTotal}</strong><small>shared resources</small></span><ArrowUpRight size={15} /></button></section>
          <section className="section-block" id="event-list"><div className="section-heading"><div><div className="eyebrow">THE CAMPUS CALENDAR</div><h2>Coming up soon <span className="section-count">{eventTotal.toString().padStart(2, '0')}</span></h2></div><button className="text-link" onClick={() => { setCategory('All events'); setSearch(''); setDateFrom(''); setDateTo('') }}>All events <ArrowRight size={15} /></button></div>
            <div className="event-tools"><div className="event-filter-row"><label className="search-box"><Search size={17} /><input aria-label="Search events" placeholder="Search events, topics, people..." value={search} onChange={(event) => { setSearch(event.target.value); setEventPage(1) }} /><kbd>⌘ K</kbd></label><label className="date-filter">FROM<input aria-label="Events from date" type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setEventPage(1) }} /></label><label className="date-filter">TO<input aria-label="Events to date" type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setDateTo(event.target.value); setEventPage(1) }} /></label></div><div className="category-list" role="group" aria-label="Filter by event category">{categories.map((item) => <button key={item} onClick={() => { setCategory(item); setEventPage(1) }} className={`category-pill ${category === item ? 'pill-selected' : ''}`}>{item}</button>)}</div></div>
            {loading ? <div className="loading-state">Gathering what’s happening<span className="loading-dots">...</span></div> : events.length ? <div className="event-grid">{events.map((item, index) => <EventCard key={item.id} item={item} index={index} registered={registrations.some((entry) => entry.id === item.id)} isAdmin={user?.role === 'admin'} onOpen={() => { setSelectedEvent(item); setModal('event') }} onRegister={() => toggleRegistration(item)} />)}</div> : <EmptyState icon={<CalendarDays size={23} />} title="No events found" copy="Try another search or choose a different category." />}
            <Pagination page={eventPage} pages={eventPages} onChange={setEventPage} />
          </section>
        </>}

        {view === 'registrations' && <section className="inner-page"><div className="inner-heading"><div><div className="eyebrow">YOUR CAMPUS CALENDAR</div><h1>My registrations</h1><p>All the things you said yes to, in one place.</p></div><span className="heading-illustration"><Ticket size={25} /></span></div>{registrations.length ? <div className="registration-list">{registrations.map((item) => <div className="registration-row" key={item.id}><DateBlock date={item.starts_at} /><div className="registration-copy"><span className="event-category">{item.category}</span><h3>{item.title}</h3><p><Clock3 size={14} /> {item.starts_time} <MapPin size={14} /> {item.venue}</p></div><span className="registered-state"><Check size={15} /> You’re going</span><button className="button button-outline" onClick={() => toggleRegistration(item)}>Cancel</button></div>)}</div> : <EmptyState icon={<Ticket size={24} />} title="Your calendar has room" copy="When you register for an event, it’ll show up here." action={<button className="button button-dark" onClick={() => changeView('discover')}>Explore events <ArrowRight size={16} /></button>} />}</section>}

        {view === 'resources' && <section className="inner-page"><div className="inner-heading"><div><div className="eyebrow">SHARED BY YOUR CAMPUS</div><h1>Resource library</h1><p>Good notes travel. Find a little help for your next big study session.</p></div><span className="heading-illustration"><BookOpen size={26} /></span></div>
          <div className="resource-toolbar"><label className="search-box resource-search"><Search size={17} /><input aria-label="Search resources" placeholder="Search notes, papers, subjects..." value={resourceSearch} onChange={(event) => { setResourceSearch(event.target.value); setResourcePage(1) }} /></label><select aria-label="Filter by subject" value={subject} onChange={(event) => { setSubject(event.target.value); setResourcePage(1) }}>{subjects.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by semester" value={semester} onChange={(event) => { setSemester(event.target.value); setResourcePage(1) }}><option>All semesters</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <option key={item}>Semester {item}</option>)}</select></div>
          <div className="resource-table-head"><span>RESOURCE</span><span>SUBJECT</span><span>SEMESTER</span><span>FORMAT</span><span /></div>{resources.length ? <div className="resource-list">{resources.map((item) => <ResourceRow key={item.id} item={item} isAdmin={user?.role === 'admin'} onDelete={() => deleteResource(item)} />)}</div> : <EmptyState icon={<BookOpen size={24} />} title="No resources yet" copy={user?.role === 'admin' ? 'Add the first set of shared notes or papers.' : 'Try another filter or check back after your classmates share.'} action={user?.role === 'admin' ? <button className="button button-dark" onClick={() => setModal('resource-form')}><Plus size={16} /> Add resource</button> : undefined} />}<Pagination page={resourcePage} pages={resourcePages} onChange={setResourcePage} />
        </section>}

        {view === 'studio' && user?.role === 'admin' && <section className="inner-page admin-page"><div className="inner-heading"><div><div className="eyebrow">THE BACKSTAGE, IN GOOD ORDER</div><h1>Admin studio</h1><p>A clear view of what’s happening across your campus.</p></div><button className="button button-dark" onClick={() => { setEditingEvent(null); setModal('event-form') }}><Plus size={16} /> Create event</button></div>
          <div className="admin-metrics"><Metric icon={<CalendarDays size={18} />} label="Total events" value={analytics.totalEvents} tint="peach" /><Metric icon={<Ticket size={18} />} label="Registrations" value={analytics.totalRegistrations} tint="green" /><Metric icon={<Users size={18} />} label="Student accounts" value={analytics.totalStudents} tint="yellow" /></div>
          <div className="studio-heading"><div><span className="eyebrow">KEEP THE GOOD STUFF COMING</span><h2>Manage events</h2></div><button className="button button-soft" onClick={() => { changeView('resources'); setModal('resource-form') }}><Upload size={16} /> Add resource</button></div>
          <div className="studio-table"><div className="studio-table-head"><span>EVENT</span><span>DATE</span><span>REGISTERED</span><span>ACTIONS</span></div>{events.map((item) => <div className="studio-row" key={item.id}><div className="studio-event"><img src={item.cover_url} alt="" /><span><strong>{item.title}</strong><small>{item.category} · {item.venue}</small></span></div><span>{dateParts(item.starts_at).month} {dateParts(item.starts_at).day}</span><button className="count-button" onClick={() => showAttendees(item)}><Users size={15} /> {item.registration_count}/{item.capacity}</button><div className="row-actions"><button className="icon-button" title="Edit event" aria-label={`Edit ${item.title}`} onClick={() => { setEditingEvent(item); setModal('event-form') }}><FileText size={16} /></button><button className="icon-button danger-icon" title="Delete event" aria-label={`Delete ${item.title}`} onClick={() => deleteEvent(item)}><Trash2 size={16} /></button></div></div>)}{!events.length && <div className="table-empty">There are no events to manage yet.</div>}</div><Pagination page={eventPage} pages={eventPages} onChange={setEventPage} />
        </section>}
        <footer className="page-footer"><span>Made for the moments between classes.</span><span>CAMPUSCONNECT <i>✳</i> 2026</span></footer>
      </div>
    </main>
    {modal && <Modal onClose={() => { setModal(null); setError('') }}>{(modal === 'login' || modal === 'signup') && <AuthPanel mode={modal} error={error} onModeChange={setModal} onSubmit={authenticate} onDemo={demoLogin} />}{modal === 'event' && selectedEvent && <EventDetail item={selectedEvent} registered={registrations.some((entry) => entry.id === selectedEvent.id)} user={user} onRegister={() => toggleRegistration(selectedEvent)} onClose={() => setModal(null)} />}{modal === 'event-form' && <EventForm item={editingEvent} error={error} onSubmit={saveEvent} />}{modal === 'resource-form' && <ResourceForm error={error} onSubmit={uploadResource} />}{modal === 'attendees' && selectedEvent && <AttendeePanel item={selectedEvent} attendees={attendees} />}</Modal>}
  </div>
}

function EventCard({ item, index, registered, isAdmin, onOpen, onRegister }: { item: CampusEvent; index: number; registered: boolean; isAdmin: boolean; onOpen: () => void; onRegister: () => void }) {
  const date = dateParts(item.starts_at)
  const remaining = Math.max(0, item.capacity - item.registration_count)
  return <article className={`event-card event-card-${index % 3}`}><button className="event-cover" onClick={onOpen} aria-label={`View ${item.title}`}><img src={item.cover_url} alt="" loading="lazy" /><span className="cover-date"><strong>{date.day}</strong><small>{date.month.toUpperCase()}</small></span><span className="cover-category">{item.category}</span><span className="cover-arrow"><ArrowUpRight size={17} /></span></button><div className="event-card-body"><button className="card-title" onClick={onOpen}>{item.title}</button><p className="event-desc">{item.description}</p><div className="event-meta"><span><Clock3 size={14} />{item.starts_time}</span><span><MapPin size={14} />{item.venue}</span></div><div className="event-card-bottom"><span className={`seat-note ${remaining < 10 ? 'seat-low' : ''}`}><i />{remaining ? `${remaining} seats left` : 'Fully booked'}</span>{!isAdmin && <button className={`button ${registered ? 'button-registered' : 'button-outline'} card-register`} onClick={onRegister} disabled={!registered && remaining === 0}>{registered ? <><Check size={15} /> Going</> : <>Join in <ArrowRight size={14} /></>}</button>}</div></div></article>
}

function DateBlock({ date }: { date: string }) { const parts = dateParts(date); return <div className="date-block"><span>{parts.month}</span><strong>{parts.day}</strong></div> }

function ResourceRow({ item, isAdmin, onDelete }: { item: CampusResource; isAdmin: boolean; onDelete: () => void }) {
  const format = item.file_name?.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF'
  return <div className="resource-row"><div className="resource-name"><span className="file-icon"><FileText size={19} /></span><span><strong>{item.title}</strong><small>{item.description}</small></span></div><span className="resource-subject">{item.subject}</span><span className="resource-semester">{item.semester}</span><span className="file-type">{format}</span><div className="resource-actions"><a className="icon-button download-button" href={`/api/resources/${item.id}/download`} title="Download resource" aria-label={`Download ${item.title}`}><ArrowDownToLine size={17} /></a>{isAdmin && <button className="icon-button danger-icon" title="Remove resource" aria-label={`Remove ${item.title}`} onClick={onDelete}><Trash2 size={16} /></button>}</div></div>
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages < 2) return null
  return <div className="pagination"><span>PAGE {page.toString().padStart(2, '0')} <i>/</i> {pages.toString().padStart(2, '0')}</span><div><button className="icon-button" disabled={page <= 1} aria-label="Previous page" onClick={() => onChange(Math.max(1, page - 1))}><ChevronLeft size={18} /></button><button className="icon-button" disabled={page >= pages} aria-label="Next page" onClick={() => onChange(Math.min(pages, page + 1))}><ChevronRight size={18} /></button></div></div>
}

function EmptyState({ icon, title, copy, action }: { icon: ReactNode; title: string; copy: string; action?: ReactNode }) { return <div className="empty-state"><span>{icon}</span><h3>{title}</h3><p>{copy}</p>{action}</div> }
function Metric({ icon, label, value, tint }: { icon: ReactNode; label: string; value: number; tint: string }) { return <div className="metric"><span className={`stat-icon stat-${tint}`}>{icon}</span><span><small>{label}</small><strong>{value.toLocaleString()}</strong></span><ArrowUpRight size={15} /></div> }

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [onClose])
  return <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="modal-panel" role="dialog" aria-modal="true">{children}<button className="modal-close icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button></div></div>
}

function AuthPanel({ mode, error, onModeChange, onSubmit, onDemo }: { mode: 'login' | 'signup'; error: string; onModeChange: (mode: ModalState) => void; onSubmit: (event: FormEvent<HTMLFormElement>, mode: 'login' | 'signup') => void; onDemo: (role: Role) => void }) {
  const signingUp = mode === 'signup'
  return <div className="auth-panel"><span className="modal-symbol"><GraduationCap size={23} /></span><div className="eyebrow">YOUR CAMPUS, IN SYNC</div><h2>{signingUp ? 'Find your people.' : 'Good to have you back.'}</h2><p>{signingUp ? 'Create a student account and make this campus yours.' : 'Sign in to save your seat and keep your campus calendar close.'}</p><form onSubmit={(event) => onSubmit(event, mode)} className="form-stack">{signingUp && <label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="e.g. Riya Shah" /></label>}<label>Campus email<input name="email" required type="email" autoComplete="email" placeholder="you@campus.edu" /></label><label>Password<input name="password" required type="password" minLength={8} autoComplete={signingUp ? 'new-password' : 'current-password'} placeholder={signingUp ? 'At least 8 characters' : 'Your password'} /></label>{error && <div className="form-error">{error}</div>}<button className="button button-dark button-wide" type="submit">{signingUp ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form>{!signingUp && <div className="demo-access"><span>TAKE A LOOK AROUND</span><div><button onClick={() => onDemo('student')}>Student demo <ArrowUpRight size={13} /></button><button onClick={() => onDemo('admin')}>Admin demo <ArrowUpRight size={13} /></button></div></div>}<div className="auth-switch">{signingUp ? 'Already part of the campus?' : 'New around here?'} <button onClick={() => onModeChange(signingUp ? 'login' : 'signup')}>{signingUp ? 'Sign in' : 'Create an account'}</button></div></div>
}

function EventDetail({ item, registered, user, onRegister, onClose }: { item: CampusEvent; registered: boolean; user: Person | null; onRegister: () => void; onClose: () => void }) {
  const date = dateParts(item.starts_at)
  return <div className="event-detail"><img className="detail-image" src={item.cover_url} alt="" /><div className="detail-body"><span className="event-category">{item.category}</span><h2>{item.title}</h2><p>{item.description}</p><div className="detail-facts"><span><CalendarDays size={17} />{date.full}</span><span><Clock3 size={17} />{item.starts_time}</span><span><MapPin size={17} />{item.venue}</span><span><Users size={17} />{Math.max(0, item.capacity - item.registration_count)} seats remaining</span></div><button className={`button button-wide ${registered ? 'button-registered' : 'button-dark'}`} onClick={onRegister}>{registered ? <><Check size={16} /> Registered · cancel registration</> : user?.role === 'admin' ? 'Admin accounts cannot register' : <>Save my seat <ArrowRight size={16} /></>}</button><button className="detail-back" onClick={onClose}>Back to the calendar</button></div></div>
}

function EventForm({ item, error, onSubmit }: { item: CampusEvent | null; error: string; onSubmit: (values: Record<string, FormDataEntryValue>) => void }) {
  return <div className="form-modal"><span className="modal-symbol"><CalendarDays size={21} /></span><div className="eyebrow">CAMPUS CALENDAR</div><h2>{item ? 'Shape the details.' : 'Put it on the calendar.'}</h2><p>{item ? 'Update the event information below.' : 'Make something worth showing up for.'}</p><form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSubmit(Object.fromEntries(new FormData(event.currentTarget).entries())) }}><label>Event name<input name="title" required defaultValue={item?.title} placeholder="e.g. Product design studio" /></label><label>Short description<textarea name="description" required rows={3} defaultValue={item?.description} placeholder="What will students do or learn?" /></label><div className="form-grid"><label>Category<select name="category" defaultValue={item?.category || 'Workshop'}>{['Workshop', 'Hackathon', 'Career', 'Community', 'Placement drive'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Date<input name="startsAt" type="date" required defaultValue={item?.starts_at} /></label></div><div className="form-grid"><label>Time<input name="startsTime" required defaultValue={item?.starts_time} placeholder="10:00 AM" /></label><label>Seat capacity<input name="capacity" type="number" min="1" max="5000" required defaultValue={item?.capacity || 40} /></label></div><label>Location<input name="venue" required defaultValue={item?.venue} placeholder="Building and room" /></label><label>Cover image URL <span className="optional-label">OPTIONAL</span><input name="coverUrl" type="url" defaultValue={item?.cover_url} placeholder="https://..." /></label>{error && <div className="form-error">{error}</div>}<button className="button button-dark button-wide" type="submit">{item ? 'Save changes' : 'Create event'} <ArrowRight size={16} /></button></form></div>
}

function ResourceForm({ error, onSubmit }: { error: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="form-modal"><span className="modal-symbol"><Upload size={20} /></span><div className="eyebrow">SHARED RESOURCE</div><h2>Pass the good notes on.</h2><p>Add a useful paper or a set of notes for your classmates.</p><form className="form-stack" onSubmit={onSubmit}><label>Resource title<input name="title" required placeholder="e.g. Database systems revision notes" /></label><label>Subject<input name="subject" required placeholder="e.g. Database Systems" /></label><label>Semester<select name="semester" required defaultValue="Semester 5">{[1, 2, 3, 4, 5, 6, 7, 8].map((value) => <option key={value}>Semester {value}</option>)}</select></label><label>A short note <span className="optional-label">OPTIONAL</span><textarea name="description" rows={2} placeholder="What’s inside?" /></label><label className="file-drop"><Upload size={18} /><span>Choose a PDF or DOCX, up to 10 MB<input name="file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></span></label>{error && <div className="form-error">{error}</div>}<button className="button button-dark button-wide" type="submit">Upload resource <ArrowRight size={16} /></button></form></div>
}

function AttendeePanel({ item, attendees }: { item: CampusEvent; attendees: { name: string; email: string; registered_at: string }[] }) {
  return <div className="attendee-panel"><span className="modal-symbol"><Users size={21} /></span><div className="eyebrow">EVENT ROSTER</div><h2>{item.title}</h2><p>{attendees.length} {attendees.length === 1 ? 'student has' : 'students have'} saved a seat.</p>{attendees.length ? <div className="attendee-list">{attendees.map((person) => <div key={person.email}><span className="avatar avatar-small">{person.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{person.name}</strong><small>{person.email}</small></span><Check size={16} /></div>)}</div> : <div className="attendee-empty">No registrations yet. The list will grow.</div>}</div>
}

export default CampusApp