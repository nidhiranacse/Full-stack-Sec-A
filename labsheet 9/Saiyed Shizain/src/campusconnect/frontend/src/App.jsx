import { useState } from "react";
import Login from "./Login.jsx";
import EventList from "./EventList.jsx";
import "./App.css";

// Lab 9 minimal shell: gate everything behind the in-memory JWT login.
export default function App() {
  const [session, setSession] = useState(null);
  return (
    <div className="app">
      <header>
        <h1>CampusConnect</h1>
        <p>Saiyed Shizain — Lab Sheet 9</p>
      </header>
      {!session ? (
        <Login onLogin={(user, accessToken) => setSession({ user, accessToken })} />
      ) : (
        <EventList token={session.accessToken} />
      )}
    </div>
  );
}
