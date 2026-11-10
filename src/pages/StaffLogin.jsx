
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      const { user } = await staffApi.login(username, password);
      navigate(user.is_superuser ? "/staff/admin" : "/staff/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="staff-login">
      <aside className="staff-login-story"><Link to="/"><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel" /></Link><span className="staff-eyebrow">THE PEOPLE BEHIND EVERY GREAT STAY</span><h2>A warm welcome.<br />A well-run day.</h2><p>Your shared space for guests, stays and all the details that make Elparaiso feel like home.</p><Link to="/">← Back to the guest website</Link></aside>
      <form onSubmit={handleSubmit} className="staff-login-card">
        <p className="staff-eyebrow">ELPARAISO HOTEL</p>

        <h1>Welcome back.</h1>

        <p>Sign in to your Elparaiso team workspace.</p>

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
