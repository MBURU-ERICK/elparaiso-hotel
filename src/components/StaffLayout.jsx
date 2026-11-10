import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, DoorOpen, Building2, Images, Users, Wallet, LogOut, Menu, X, ArrowUpRight, ChevronRight } from 'lucide-react';
import { staffApi } from '../services/staffApi';
export default function StaffLayout() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
  const permits = action => user.is_superuser || user.facilities?.some(f => f.actions?.includes(action));
  const destinations = [
    ['/staff/admin', 'Administration', Users, user.is_superuser],
    ['/staff/dashboard', 'Overview', LayoutDashboard, true],
    ['/staff/reservations', 'Reservations', BedDouble, permits('view')],
    ['/staff/rooms', 'Room management', DoorOpen, permits('view')],
    ['/staff/airbnb', 'Private stays', Building2, permits('view')],
    ['/staff/customers', 'Booking inbox & invoices', Users, permits('view')],
    ['/staff/gallery', 'Photo library', Images, permits('manage')],
    ['/staff/reconciliation', 'Payments & reviews', Wallet, permits('payments_manage')],
  ].filter(([, , , visible]) => visible);
  const current = destinations.find(([to]) => pathname === to)?.[1] || 'Workspace';
  const name = user.first_name || user.username;
  return <div className="staff-workspace"><aside className="staff-sidebar">
    <Link to="/staff/dashboard" className="staff-brand"><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel" /><span>TEAM WORKSPACE</span></Link>
    <button className="staff-menu" aria-expanded={open} aria-controls="staff-navigation" onClick={() => setOpen(v => !v)}>{open ? <X size={18} /> : <Menu size={18} />} {open ? 'Close menu' : 'Workspace menu'}</button>
    <div className="staff-nav-heading">MANAGE YOUR DAY</div>
    <nav id="staff-navigation" className={open ? 'is-open' : ''} aria-label="Staff navigation">{destinations.map(([to, title, Icon]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}><Icon size={19} /><span>{title}</span></NavLink>)}</nav>
    <Link to="/" className="staff-visit-site">View guest website <ArrowUpRight size={16} /></Link>
    <div className="staff-profile"><span className="staff-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong><small>{user.is_superuser ? 'Administrator' : 'Hotel team'}</small></div><button onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    {error && <p role="alert">{error}</p>}
  </aside><div className="staff-main"><header className="staff-topbar"><div><span>Elparaiso</span><ChevronRight size={14} /><strong>{current}</strong></div><span className="staff-team-tag">Staff portal</span></header><div className="staff-content"><Outlet context={{ user }} /></div></div></div>;
}
