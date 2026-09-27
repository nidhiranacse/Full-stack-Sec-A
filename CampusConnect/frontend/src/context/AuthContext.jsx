import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("campusconnect_token") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const savedToken = localStorage.getItem("campusconnect_token");
            const savedUser = localStorage.getItem("campusconnect_user");

            if (savedToken && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    // Optionally verify token with backend
                    const res = await API.get("/auth/me");
                    if (res.data.success) {
                        setUser(res.data.user);
                        localStorage.setItem("campusconnect_user", JSON.stringify(res.data.user));
                    }
                } catch (err) {
                    console.error("Session verification failed, logging out:", err);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyUser();
    }, []);

    const login = async (email, password) => {
        const res = await API.post("/auth/login", { email, password });
        if (res.data.success) {
            const { token, user } = res.data;
            setToken(token);
            setUser(user);
            localStorage.setItem("campusconnect_token", token);
            localStorage.setItem("campusconnect_user", JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: res.data.message };
    };

    const register = async (userData) => {
        const res = await API.post("/auth/register", userData);
        if (res.data.success) {
            const { token, user } = res.data;
            setToken(token);
            setUser(user);
            localStorage.setItem("campusconnect_token", token);
            localStorage.setItem("campusconnect_user", JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: res.data.message };
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("campusconnect_token");
        localStorage.removeItem("campusconnect_user");
    };

    const isAdmin = user?.role === "admin";
    const isStudent = user?.role === "student";

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAdmin,
                isStudent
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
