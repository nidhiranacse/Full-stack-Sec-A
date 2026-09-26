import { Bell, Search } from "lucide-react";

function DashboardNavbar() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const name = user.name || "Student";

    return (
        <header className="dashboard-navbar">
            <div className="dashboard-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search events, resources..."
                />
            </div>

            <div className="navbar-user">
                <button className="notification-btn">
                    <Bell size={19} />
                    <span></span>
                </button>

                <div className="user-avatar">
                    {name.charAt(0).toUpperCase()}
                </div>

                <div className="navbar-user-info">
                    <strong>{name}</strong>
                    <span>Student</span>
                </div>
            </div>
        </header>
    );
}

export default DashboardNavbar;