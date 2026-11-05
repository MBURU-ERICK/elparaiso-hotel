import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { staffApi } from '../services/staffApi';
export default function StaffLayout() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    staffApi.me().then(data => { if (active) setUser(data.user); }).catch(err => {
      if (!active) return;
      if ([401, 403].includes(err.status)) navigate('/staff/login', { replace: true }); else setError(err.message);
    });
    return () => { active = false; };
  }, [navigate]);
  async function logout() {
    try { await staffApi.logout(); navigate('/staff/login', { replace: true }); }
    catch (err) { setError(err.message); }
  }
  if (error && !user) return <main className="section"><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
  if (!user) return <main className="section"><p role="status">Loading your workspace…</p></main>;
  const permits = action => user.is_superuser || user.facilities?.some(f => f.actions.includes(action));
  return <div className="staff-workspace"><aside className="staff-sidebar">
    <div><p className="eyebrow">ELPARAISO HOTEL</p><h2>Staff workspace</h2></div>
    <button className="staff-menu" aria-expanded={open} aria-controls="staff-navigation" onClick={() => setOpen(v => !v)}>Workspace menu</button>
    <nav id="staff-navigation" className={open ? 'is-open' : ''} aria-label="Staff navigation">
      {[['/staff/dashboard', 'Overview', true], ['/staff/reservations', 'Reservations', permits('view')], ['/staff/rooms', 'Rooms', permits('view')], ['/staff/airbnb', 'Airbnb bookings', permits('view')], ['/staff/gallery', 'Gallery', permits('manage')], ['/staff/reconciliation', 'M-Pesa & accountant reviews', permits('payments_manage')]].filter(([, , visible]) => visible).map(([to, title]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{title}</NavLink>)}
    </nav><div className="staff-profile"><p>Signed in as <strong>{user.first_name || user.username}</strong></p><button onClick={logout}>Sign out</button></div>
    {error && <p role="alert">{error}</p>}
  </aside><div className="staff-content"><Outlet context={{ user }} /></div></div>;
}
