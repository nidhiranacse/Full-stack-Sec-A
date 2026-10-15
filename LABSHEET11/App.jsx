import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import "./App.css";

function Home() {
  return (
    <div className="home">
      <nav>
        <h2>🎓 CampusConnect</h2>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <p className="tag">COLLEGE EVENT & RESOURCE PORTAL</p>
          <h1>Connect. Learn.<br />Grow Together.</h1>

          <p>
            Discover workshops, hackathons, placement drives and
            useful academic resources — all in one place.
          </p>

          <Link className="btn" to="/login">
            Get Started →
          </Link>
        </div>

        <div className="hero-card">
          <span>📅</span>
          <h3>Upcoming Events</h3>
          <p>Workshops • Hackathons • Placements</p>

          <div className="mini-card">
            🎯 Web Development Workshop
          </div>

          <div className="mini-card">
            💼 Placement Drive 2026
          </div>
        </div>
      </section>

      <section className="features">
        <div>
          <span>📅</span>
          <h3>Events</h3>
          <p>Explore and register for college events.</p>
        </div>

        <div>
          <span>📚</span>
          <h3>Resources</h3>
          <p>Access notes and previous year papers.</p>
        </div>

        <div>
          <span>📊</span>
          <h3>Dashboard</h3>
          <p>Track registrations and activities.</p>
        </div>
      </section>
    </div>
  );
}


// LOGIN
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:30000/api/auth/login",
        {
          email,
          password
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="form-page">
      <form className="form-box" onSubmit={handleLogin}>

        <h1>Welcome Back 👋</h1>
        <p>Login to your CampusConnect account</p>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Login
        </button>

        <p>
          Don't have an account?
          <Link to="/signup"> Signup</Link>
        </p>

        <Link to="/">
          ← Back to Home
        </Link>

      </form>
    </div>
  );
}


// TEMP STUDENT DASHBOARD
function Dashboard() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const getEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:30000/api/events"
      );

      setEvents(response.data);
    } catch (error) {
      setMessage("Unable to load events");
    }
  };

  const registerEvent = async (id) => {
    try {
      await axios.post(
        `http://localhost:30000/api/events/${id}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage("✅ Registered successfully!");
      getEvents();

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <div className="dashboard">

      <nav>
        <h2>🎓 CampusConnect</h2>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </nav>

      <div className="dashboard-content">

        <h1>Upcoming Events 📅</h1>

        <p>
          Explore college events and register for the ones
          you are interested in.
        </p>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <div className="events-grid">

          {events.map((event) => (

            <div className="event-card" key={event._id}>

              <span className="event-category">
                {event.category}
              </span>

              <h2>{event.title}</h2>

              <p>{event.description}</p>

              <p>📅 {new Date(event.date).toLocaleDateString()}</p>

              <p>📍 {event.venue}</p>

              <p>
                💺 Available Seats:{" "}
                {event.totalSeats -
                  event.registeredStudents.length}
              </p>

              <button
                onClick={() => registerEvent(event._id)}
              >
                Register Now
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

// TEMP ADMIN DASHBOARD
function Admin() {
  return (
    <div className="form-page">
      <div className="form-box">
        <h1>👑 Admin Dashboard</h1>
        <p>Admin login successful!</p>

        <button onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}>
          Logout
        </button>
      </div>
    </div>
  );
}


function Signup() {
  return (
    <div className="form-page">
      <div className="form-box">

        <h1>Create Account 🚀</h1>
        <p>Join CampusConnect today</p>

        <input
          type="text"
          placeholder="Full Name"
        />

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button>
          Signup
        </button>

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

        <Link to="/">
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/admin" element={<Admin />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
