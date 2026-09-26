import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-page">
            <nav className="navbar">
                <h2>CampusConnect</h2>

                <div>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Register</Link>
                </div>
            </nav>

            <main className="hero">
                <p className="tag">COLLEGE EVENT PORTAL</p>

                <h1>
                    Everything happening
                    <br />
                    on your campus.
                </h1>

                <p>
                    Discover events, register for workshops and hackathons,
                    and access study resources from one place.
                </p>

                <div className="hero-buttons">
                    <Link to="/events">Explore Events</Link>
                    <Link to="/signup">Create Account</Link>
                </div>
            </main>
        </div>
    );
}

export default Home;