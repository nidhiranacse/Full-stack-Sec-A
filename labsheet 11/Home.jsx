import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home">

            <section className="hero">

                <div className="hero-content">

                    <h1>
                        Welcome to CampusConnect
                    </h1>

                    <p>
                        Your one-stop portal for
                        college events, workshops,
                        hackathons and study resources.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/events"
                            className="primary-btn"
                        >
                            Explore Events
                        </Link>

                        <Link
                            to="/resources"
                            className="secondary-btn"
                        >
                            Browse Resources
                        </Link>

                    </div>

                </div>

            </section>


            <section className="features">

                <div className="feature-card">
                    <h3>📅 Events</h3>
                    <p>
                        Discover workshops, hackathons
                        and placement drives.
                    </p>
                </div>

                <div className="feature-card">
                    <h3>📚 Resources</h3>
                    <p>
                        Access notes, assignments and
                        previous year papers.
                    </p>
                </div>

                <div className="feature-card">
                    <h3>🎓 Student Dashboard</h3>
                    <p>
                        Manage your event registrations
                        from one place.
                    </p>
                </div>

            </section>

        </div>
    );
}

export default Home;