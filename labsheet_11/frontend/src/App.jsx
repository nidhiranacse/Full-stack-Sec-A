import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Home() {
    return (
        <div>
            <h1>Welcome to CampusConnect</h1>
            <a href="/login">Login</a>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/student"
                    element={<StudentDashboard />}
                />
                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;