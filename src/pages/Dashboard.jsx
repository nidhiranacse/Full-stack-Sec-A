import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [message, setMessage] = useState("");

    const accessToken = useSelector(
        (state) => state.auth.accessToken
    );

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const getProfile = async () => {
            if (!accessToken) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(
                    "http://localhost:5000/api/auth/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        withCredentials: true
                    }
                );

                setProfile(response.data.user);
            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                    "Unable to load profile"
                );
            }
        };

        getProfile();
    }, [accessToken, navigate]);
    const handleLogout = async () => {
    try {
        await axios.post(
            "http://localhost:5000/api/auth/logout",
            {},
            {
                withCredentials: true
            }
        );
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        dispatch(logout());
        navigate("/login");
    }
};
    return (
        <div>
            <h1>CampusConnect Dashboard</h1>

            {profile ? (
                <>
                    <h2>Welcome, {profile.name}!</h2>

                    <p>
                        <strong>Email:</strong> {profile.email}
                    </p>

                    <p>
                        <strong>Role:</strong> {profile.role}
                    </p>

                    <p>
                        JWT Protected API: ✅ Connected
                    </p>
                </>
            ) : (
                <p>{message || "Loading profile..."}</p>
            )}

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;