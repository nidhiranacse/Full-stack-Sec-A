import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful!");

      navigate("/login");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div>
      <h1>CampusConnect</h1>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">
          Register
        </button>

      </form>
    </div>
  );
}

export default Register;