import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";

function Home() {
    return (
        <div>
            <h1>CampusConnect</h1>
            <p>College Club & Event Management System</p>

            <Link to="/login">
                <button>Login</button>
            </Link>

            {" "}

            <Link to="/register">
                <button>Register</button>
            </Link>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/">Home</Link> |{" "}
                <Link to="/login">Login</Link> |{" "}
                <Link to="/register">Register</Link>
                {" | "}
                <Link to="/chat">Chat</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/chat" element={<Chat />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;