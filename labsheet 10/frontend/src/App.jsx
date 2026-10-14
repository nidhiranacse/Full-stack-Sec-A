import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./index.css";

const API = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [page, setPage] = useState("login");
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({});
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: ""
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: ""
  });

  const api = axios.create({
    baseURL: API,
    withCredentials: true
  });

  api.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  async function submitAuth(e) {
    e.preventDefault();
    setMessage("");

    try {
      const endpoint = page === "login" ? "/auth/login" : "/auth/register";
      const response = await api.post(endpoint, form);

      setToken(response.data.accessToken);
      setUser(response.data.user);
      setPage("dashboard");
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to connect to server");
    }
  }

  async function loadEvents() {
    try {
      const response = await api.get("/events", {
        params: { search, page: 1 }
      });
      setEvents(response.data.events);
    } catch {
      setMessage("Could not load events");
    }
  }

  async function loadAnnouncements() {
    try {
      const response = await api.get("/announcements");
      setAnnouncements(response.data.announcements);
    } catch {
      setAnnouncements([]);
    }
  }

  useEffect(() => {
    if (!user || !token) return;

    loadEvents();
    loadAnnouncements();

    const socket = io("http://localhost:5000", {
      auth: { token },
      reconnection: true
    });

    socket.on("new-announcement", announcement => {
      setAnnouncements(previous => [announcement, ...previous]);
      setToast(`New announcement: ${announcement.title}`);
      setTimeout(() => setToast(""), 4000);
    });

    return () => socket.disconnect();
  }, [user, token]);

  useEffect(() => {
    if (user) loadEvents();
  }, [search]);

  async function createEvent(e) {
    e.preventDefault();

    try {
      await api.post("/events", eventForm);
      setEventForm({ title: "", description: "", date: "", location: "" });
      setMessage("Event created successfully");
      loadEvents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create event");
    }
  }

  async function publishAnnouncement(e) {
    e.preventDefault();

    try {
      await api.post("/announcements", announcementForm);
      setAnnouncementForm({ title: "", message: "" });
      setMessage("Announcement published successfully");
      loadAnnouncements();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not publish announcement");
    }
  }

  async function rsvp(id) {
    try {
      const response = await api.post(`/events/${id}/rsvp`);
      setMessage(response.data.message);
      loadEvents();
    } catch {
      setMessage("Could not update RSVP");
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {}

    setUser(null);
    setToken("");
    setPage("login");
    setEvents([]);
    setAnnouncements([]);
    setMessage("");
  }

  if (!user) {
    return (
      <main className="auth-page">
        <form className="auth-card" onSubmit={submitAuth}>
          <div className="logo">CC</div>
          <h1>CampusConnect</h1>
          <p>Everything happening on your campus.</p>

          <div className="tabs">
            <button type="button" className={page === "login" ? "selected" : ""} onClick={() => setPage("login")}>Login</button>
            <button type="button" className={page === "register" ? "selected" : ""} onClick={() => setPage("register")}>Register</button>
          </div>

          {page === "register" && (
            <input placeholder="Full name" required onChange={e => setForm({ ...form, name: e.target.value })} />
          )}

          <input type="email" placeholder="Email address" required onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password (minimum 8 characters)" required minLength={8} onChange={e => setForm({ ...form, password: e.target.value })} />

          {message && <div className="message">{message}</div>}

          <button className="primary" type="submit">
            {page === "login" ? "Login to your account" : "Create account"}
          </button>

          <small>Campus events, announcements and student activities in one place.</small>
        </form>
      </main>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="logo">CC</span> CampusConnect</div>
        <p className="side-label">WORKSPACE</p>
        <button className="nav-active">Dashboard</button>
        <button onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}>Campus Events</button>
        <button onClick={() => document.getElementById("announcements")?.scrollIntoView({ behavior: "smooth" })}>Announcements</button>
        <div className="profile">
          <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div><strong>{user.name}</strong><small>{user.role}</small></div>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="content">
        <header>
          <div><p className="eyebrow">CAMPUS PORTAL</p><h1>Dashboard</h1><p>Welcome back, {user.name}.</p></div>
          <span className="role-badge">{user.role}</span>
        </header>

        {toast && <div className="toast">{toast}</div>}
        {message && <div className="message">{message}</div>}

        <section className="stats">
          <div className="stat-card"><span>Total Events</span><h2>{events.length}</h2><small>Campus activities</small></div>
          <div className="stat-card"><span>Announcements</span><h2>{announcements.length}</h2><small>Campus updates</small></div>
          <div className="stat-card"><span>Your Role</span><h2>{user.role === "ADMIN" ? "Admin" : "Student"}</h2><small>Access level</small></div>
        </section>

        {user.role === "ADMIN" && (
          <section className="panel">
            <h2>Create an event</h2>
            <form className="event-form" onSubmit={createEvent}>
              <input placeholder="Event title" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
              <input placeholder="Location" required value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
              <input type="datetime-local" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
              <textarea placeholder="Event description" required value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
              <button className="primary">Publish event</button>
            </form>
          </section>
        )}

        <section className="panel" id="events">
          <div className="section-heading"><div><h2>Campus Events</h2><p>Discover what's happening around you.</p></div>
            <input className="search" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="event-list">
            {events.map(event => (
              <article className="event-card" key={event._id}>
                <div className="event-date">{new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                <div className="event-info"><h3>{event.title}</h3><p>{event.description}</p><small>{event.location} · {new Date(event.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small></div>
                <button className="secondary" onClick={() => rsvp(event._id)}>RSVP</button>
              </article>
            ))}
            {events.length === 0 && <p className="empty">No events found. Try another search.</p>}
          </div>
        </section>

        {user.role === "ADMIN" && (
          <section className="panel">
            <h2>Publish an announcement</h2>
            <form className="event-form" onSubmit={publishAnnouncement}>
              <input placeholder="Announcement title" required value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
              <textarea placeholder="Write your announcement..." required value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} />
              <button className="primary">Publish announcement</button>
            </form>
          </section>
        )}

        <section className="panel" id="announcements">
          <h2>Latest Announcements</h2>
          {announcements.map(item => (
            <article className="announcement" key={item._id}>
              <div className="announcement-icon">!</div>
              <div><h3>{item.title}</h3><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
            </article>
          ))}
          {announcements.length === 0 && <p className="empty">No announcements yet.</p>}
        </section>
        <footer>CampusConnect · College Events & Announcements Portal</footer>
      </main>
    </div>
  );
}

export default App;