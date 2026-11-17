import '../styles/staff-refresh.css';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, DoorOpen, Building2, Images, Users, Wallet, LogOut, Menu, X, ArrowUpRight, ChevronRight, Star, CalendarDays } from 'lucide-react';
import { permitsFacilityType } from '../utils/staffFacilities';
import { Navigate } from 'react-router-dom';
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
  }, [navigate, pathname]);
  async function logout() {
    try { await staffApi.logout(); navigate('/staff/login', { replace: true }); }
    catch (err) { setError(err.message); }
  }
  if (error && !user) return <main className="section"><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
  if (!user) return <main className="section"><p role="status">Loading your workspace…</p></main>;
  const permits = action => user.is_superuser || user.facilities?.some(f => f.actions?.includes(action));
  const hotel = permitsFacilityType(user, ['hotel', 'mixed']);
  const privateStays = permitsFacilityType(user, ['airbnb', 'mixed']);
  const destinations = [
    ['/staff/profile', 'My profile', Users, true],
    ['/staff/events', 'Events & advertisements', CalendarDays, permits('view')],
    ['/staff/event-types', 'Event types', CalendarDays, user.is_superuser],
    ['/staff/contacts', 'Contact configuration', Users, user.is_superuser],
    ['/staff/guest-reservations', 'All guest reservations', BedDouble, permits('view')],
    ['/staff/facilities', 'Facilities', Building2, user.is_superuser],
    ['/staff/user-rights', 'User rights', Users, user.is_superuser],
    ['/staff/admin', 'Administration', Users, user.is_superuser],
    ['/staff/dashboard', 'Overview', LayoutDashboard, true],
    ['/staff/reservations', 'Hotel reservations', BedDouble, hotel],
    ['/staff/room-categories', 'Room categories & rates', BedDouble, user.is_superuser],
    ['/staff/rooms', 'Hotel room management', DoorOpen, hotel],
    ['/staff/airbnb', 'Private-stay reservations', Building2, privateStays],
    ['/staff/airbnb/rooms', 'Private-stay room management', DoorOpen, privateStays],
    ['/staff/packages', 'Conference packages', CalendarDays, permits('view')],
    ['/staff/reviews', 'Guest reviews', Star, permits('view')],
    ['/staff/customers', 'Booking inbox & invoices', Users, permits('view')],
    ['/staff/gallery', 'Photo library', Images, permits('manage')],
    ['/staff/reconciliation', 'Payment reconciliation', Wallet, permits('payments_manage')],
  ].filter(([, , , visible]) => visible);
  const blocked = !destinations.some(([to]) => pathname === to);
  const current = destinations.find(([to]) => pathname === to)?.[1] || 'Workspace';
  const name = user.first_name || user.username;
  return <div className="staff-workspace"><aside className="staff-sidebar">
    <Link to="/staff/dashboard" className="staff-brand"><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel" /><span>TEAM WORKSPACE</span></Link>
    <button className="staff-menu" aria-expanded={open} aria-controls="staff-navigation" onClick={() => setOpen(v => !v)}>{open ? <X size={18} /> : <Menu size={18} />} {open ? 'Close menu' : 'Workspace menu'}</button>
    <div className="staff-nav-heading">MANAGE YOUR DAY</div>
    <nav id="staff-navigation" className={open ? 'is-open' : ''} aria-label="Staff navigation">{destinations.map(([to, title, Icon]) => <NavLink end key={to} to={to} onClick={() => setOpen(false)}><Icon size={19} /><span>{title}</span></NavLink>)}</nav>
    <Link to="/" className="staff-visit-site">View guest website <ArrowUpRight size={16} /></Link>
    <div className="staff-profile"><span className="staff-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong><small>{user.is_superuser ? 'Administrator' : user.facilities?.map(f => `${f.name} · ${f.role}`).join(', ') || 'No facility assigned'}</small></div><button onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    {error && <p role="alert">{error}</p>}
  </aside><div className="staff-main"><header className="staff-topbar"><div><span>Elparaiso</span><ChevronRight size={14} /><strong>{current}</strong></div><span className="staff-team-tag">Staff portal</span></header><div className="staff-content">{pathname === '/staff/rooms' && !hotel && privateStays ? <Navigate to="/staff/airbnb/rooms" replace /> : blocked ? <p role="alert">You do not have access to this page.</p> : <Outlet context={{ user }} />}</div></div></div>;
}
