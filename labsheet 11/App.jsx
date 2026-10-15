import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Resources from "./pages/Resources";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route path="/" element={<Home />} />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/signup"
                    element={<Signup />}
                />

                <Route
                    path="/events"
                    element={<Events />}
                />

                <Route
                    path="/events/:id"
                    element={<EventDetails />}
                />

                <Route
                    path="/resources"
                    element={<Resources />}
                />

                <Route
                    path="/student-dashboard"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/admin-dashboard"
                    element={<AdminDashboard />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;