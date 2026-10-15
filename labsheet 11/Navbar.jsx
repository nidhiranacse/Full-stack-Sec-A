import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="logo">
                <Link to="/">
                    CampusConnect
                </Link>
            </div>

            <div className="nav-links">

                <Link to="/">
                    Home
                </Link>

                <Link to="/events">
                    Events
                </Link>

                <Link to="/resources">
                    Resources
                </Link>

                {token && user?.role === "student" && (
                    <Link to="/student-dashboard">
                        Dashboard
                    </Link>
                )}

                {token && user?.role === "admin" && (
                    <Link to="/admin-dashboard">
                        Admin Dashboard
                    </Link>
                )}

                {!token ? (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/signup">
                            Signup
                        </Link>
                    </>
                ) : (
                    <button
                        onClick={logout}
                        className="logout-btn"
                    >
                        Logout
                    </button>
                )}

            </div>

        </nav>
    );
}

export default Navbar;