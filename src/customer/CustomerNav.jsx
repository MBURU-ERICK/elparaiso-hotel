import { useState } from 'react';
import { customerApi } from './customerApi';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Compass, BedDouble, CalendarDays, MessagesSquare, Receipt, CircleUserRound, Building2, LogOut } from 'lucide-react';
import { useCustomer } from './context';
const destinations = [['/account', 'Overview', Compass], ['/booking', 'Book a room', BedDouble], ['/airbnb', 'Private stays', Building2], ['/account/requests/new', 'Plan an event', CalendarDays], ['/account/requests', 'Requests', MessagesSquare], ['/account/reviews', 'Reviews', MessagesSquare], ['/account/invoices', 'Invoices', Receipt], ['/account/profile', 'Profile', CircleUserRound]];
export default function CustomerNav() {
  const { user, refresh } = useCustomer(); const { pathname } = useLocation(); const navigate = useNavigate();
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function logout() { setBusy(true); setError(''); try { await customerApi.auth('logout'); await refresh(); navigate('/account/login'); } catch { setError('Sign out failed. Try again.'); } finally { setBusy(false); } }
  if (!user || !(/^\/account(\/|$)/.test(pathname) || pathname === '/booking' || pathname === '/airbnb') || /^\/account\/(login|register|forgot|reset|verify)$/.test(pathname)) return null;
  return <nav className="guest-navigation" aria-label="Your guest account">{destinations.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/account' || to === '/account/requests'}><Icon size={18} /><span>{label}</span></NavLink>)}<button type="button" onClick={logout} disabled={busy}><LogOut size={17} />{busy ? 'Signing out…' : 'Sign out'}</button>{error && <span role="alert">{error}</span>}</nav>;
}
