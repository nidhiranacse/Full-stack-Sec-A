import {
    UserRound,
    Mail,
    ShieldCheck,
    GraduationCap,
    LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StudentSidebar from "../components/StudentSidebar";
import DashboardNavbar from "../components/DashboardNavbar";

function Profile() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="dashboard-layout">
            <StudentSidebar />

            <main className="dashboard-main">
                <DashboardNavbar />

                <div className="dashboard-content">

                    <section className="events-hero">
                        <div>
                            <div className="welcome-badge">
                                <UserRound size={14} />
                                ACCOUNT
                            </div>

                            <h1>My Profile</h1>

                            <p>
                                Manage and view your CampusConnect
                                account information.
                            </p>
                        </div>
                    </section>

                    <section className="profile-card">

                        <div className="profile-header">
                            <div className="profile-avatar">
                                {user.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "S"}
                            </div>

                            <div>
                                <h2>
                                    {user.name || "Student"}
                                </h2>

                                <span className="profile-role">
                                    <GraduationCap size={15} />
                                    {user.role || "student"}
                                </span>
                            </div>
                        </div>

                        <div className="profile-divider" />

                        <div className="profile-details">

                            <div className="profile-detail">
                                <div className="profile-detail-icon">
                                    <UserRound size={19} />
                                </div>

                                <div>
                                    <span>Full Name</span>
                                    <strong>
                                        {user.name || "Not available"}
                                    </strong>
                                </div>
                            </div>

                            <div className="profile-detail">
                                <div className="profile-detail-icon">
                                    <Mail size={19} />
                                </div>

                                <div>
                                    <span>Email Address</span>
                                    <strong>
                                        {user.email || "Not available"}
                                    </strong>
                                </div>
                            </div>

                            <div className="profile-detail">
                                <div className="profile-detail-icon">
                                    <ShieldCheck size={19} />
                                </div>

                                <div>
                                    <span>Account Role</span>
                                    <strong>
                                        {user.role || "Student"}
                                    </strong>
                                </div>
                            </div>

                        </div>

                        <div className="profile-security">
                            <div>
                                <ShieldCheck size={20} />

                                <div>
                                    <strong>
                                        Account secured
                                    </strong>

                                    <p>
                                        Your account is protected with
                                        JWT authentication.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            className="profile-logout"
                            onClick={logout}
                        >
                            <LogOut size={17} />
                            Logout from CampusConnect
                        </button>

                    </section>

                </div>
            </main>
        </div>
    );
}

export default Profile;