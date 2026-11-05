
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffApi } from "../services/staffApi";
import "../styles/staff.css";

export default function StaffLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await staffApi.login(username, password);
      navigate("/staff/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="staff-login">
      <form onSubmit={handleSubmit} className="staff-login-card">
        <p className="staff-eyebrow">ELPARAISO HOTEL</p>

        <h1>Staff Portal</h1>

        <p>Sign in to manage hotel operations.</p>

        {error && <div role="alert">{error}</div>}

        <label htmlFor="staff-username">Username</label>
        <input
          id="staff-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="staff-password">Password</label>
        <input
          id="staff-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
