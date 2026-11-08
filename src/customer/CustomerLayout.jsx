import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useCustomer } from './context';
import { customerApi } from './customerApi';
import SEO from '../components/SEO';
export default function CustomerLayout() {
  const { user, refresh } = useCustomer(); const navigate = useNavigate();
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function resend() { setBusy(true); try { setMessage((await customerApi.auth('resend', { email: user.email })).detail); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  async function logout() { try { await customerApi.auth('logout'); await refresh(); navigate('/account/login'); } catch (err) { setError(err.message); } }
  return <div className="customer-workspace"><SEO title="Customer portal" description="Your private Elparaiso Hotel workspace." noindex path="/account" />
    <aside className="customer-sidebar"><p className="eyebrow">YOUR ELPARAISO</p><h2>Guest workspace</h2><nav aria-label="Customer navigation"><NavLink to="/account" end>Overview</NavLink><NavLink to="/account/requests">Requests & quotations</NavLink><NavLink to="/account/reviews">My reviews</NavLink><NavLink to="/account/invoices">Invoices</NavLink><NavLink to="/account/profile">My profile</NavLink><Link to="/booking">Book a room</Link><Link to="/airbnb">Book an Airbnb stay</Link></nav><div className="customer-identity"><strong>{user.name}</strong><span>{user.company || 'Personal account'}</span><span>{user.email}</span><button onClick={logout}>Sign out</button></div></aside>
    <main className="customer-content">{!user.verified && <section className="portal-notice"><h2>One more step: verify your email</h2><p>We sent a verification link to {user.email}. Verify it before submitting requests or bookings.</p><button disabled={busy} onClick={resend}>Resend verification email</button><button onClick={refresh}>I have verified my email</button></section>}
      {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}<Outlet /></main></div>;
}
