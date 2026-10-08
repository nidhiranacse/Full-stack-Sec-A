import {
    LayoutDashboard,
    CalendarDays,
    BookmarkCheck,
    FileText,
    UserRound,
    LogOut,
    GraduationCap
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function StudentSidebar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const links = [
        {
            name: "Dashboard",
            path: "/student",
            icon: LayoutDashboard
        },
        {
            name: "Browse Events",
            path: "/student/events",
            icon: CalendarDays
        },
        {
            name: "My Events",
            path: "/student/my-events",
            icon: BookmarkCheck
        },
        {
            name: "Resources",
            path: "/student/resources",
            icon: FileText
        }
    ];

    return (
        <aside className="student-sidebar">
            <div>
                <div className="sidebar-brand">
                    <div className="sidebar-logo">
                        <GraduationCap size={21} />
                    </div>
                    <span>CampusConnect</span>
                </div>

                <div className="sidebar-section-title">
                    MAIN MENU
                </div>

                <nav className="sidebar-nav">
                    {links.map((link) => {
                        const Icon = link.icon;

                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === "/student"}
                                className={({ isActive }) =>
                                    `sidebar-link ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span>{link.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <NavLink
                    to="/student/profile"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <UserRound size={18} />
                    <span>My Profile</span>
                </NavLink>

                <button
                    className="sidebar-link sidebar-logout"
                    onClick={logout}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default StudentSidebar;