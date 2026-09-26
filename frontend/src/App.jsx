import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import Events from "./pages/Events";
import MyEvents from "./pages/MyEvents";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Student */}
      <Route
        path="/student"
        element={<StudentDashboard />}
      />

      <Route
        path="/student/events"
        element={<Events />}
      />

      <Route
        path="/student/my-events"
        element={<MyEvents />}
      />

      <Route
        path="/student/profile"
        element={<Profile />}
      />
    </Routes>
  );
}

export default App;