import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './verification.css';
import { ShieldCheck, MailCheck, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { customerApi, safeNext } from './customerApi';
import { useCustomer } from './context';
export default function CustomerAuth({ mode = 'login' }) {
  const [search] = useSearchParams(); const navigate = useNavigate();
  const { refresh } = useCustomer();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const title = { login: 'Welcome back.', register: 'Your next visit starts here.', forgot: 'Reset your password.', reset: 'Choose a new password.', verify: 'Verify your email.' }[mode];
  const next = safeNext(search.get('next'));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (['verify', 'reset'].includes(mode)) data.token = search.get('token') || '';
    try {
      const result = await customerApi.auth(mode, data);
      if (mode === 'login') { await refresh(); navigate(next, { replace: true }); }
      else { setMessage(result.detail); if (mode === 'verify') await refresh(); }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="customer-auth"><SEO title="Customer account" description="Manage Elparaiso Hotel requests and invoices securely." noindex path={`/account/${mode}`} />
    <aside className="auth-story"><span className="eyebrow">ELPARAISO, AT YOUR SERVICE</span><h1>A warm welcome.<br />A simpler way to plan.</h1><p>Bring your team together in Rumuruti. Request a tailored quotation, follow every conversation and review your invoices in one place.</p><div className="auth-benefits"><span>01 · Tailored group stays</span><span>02 · Conference enquiries</span><span>03 · Invoices, always at hand</span></div></aside>
    <section className={`auth-card ${mode === 'verify' ? 'verification-card' : ''}`}><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel" width="220" height="90" />{mode === 'verify' && <div className="verification-emblem">{message ? <MailCheck size={42} aria-hidden="true" /> : <ShieldCheck size={42} aria-hidden="true" />}</div>}<h2>{mode === 'verify' && message ? 'You’re ready for your next stay.' : title}</h2><p>{mode === 'login' ? 'Sign in to book, request a quotation or review an invoice.' : mode === 'verify' ? 'One final step. Confirm your email to book your stay and keep every detail in one place.' : 'Your details stay in your private customer workspace.'}</p>
      {error && <p role="alert" className="portal-alert">{error}</p>}{message && <p role="status" className="portal-notice">{message}</p>}
      {mode === 'verify' && message ? <Link className="portal-button verification-continue" to="/account/login?next=%2Fbooking">Continue to book <ArrowRight size={18} aria-hidden="true" /></Link> : <form onSubmit={submit} className="portal-form">
        {mode === 'register' && <><label>Full name<input name="name" autoComplete="name" maxLength={150} required /></label><label>Company / organisation<input name="company" autoComplete="organization" maxLength={180} /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} required /></label></>}
        {['login', 'register', 'forgot'].includes(mode) && <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>}
        {['login', 'register', 'reset'].includes(mode) && <label>{mode === 'reset' ? 'New password' : 'Password'}<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 8} maxLength={1024} required /></label>}
        <button className="portal-button" disabled={busy || (mode === 'verify' && !search.get('token'))}>{busy ? 'Please wait…' : { login: 'Sign in', register: 'Create account', forgot: 'Email reset link', reset: 'Save new password', verify: 'Verify my email' }[mode]}</button>
      </form>}
      {mode === 'verify' && !search.get('token') && <p role="alert">This link is incomplete. Open the full link in your verification email.</p>}
      <div className="auth-links"><Link to={`/account/${mode === 'login' ? 'register' : 'login'}?next=${encodeURIComponent(next)}`}>{mode === 'login' ? 'New here? Create an account' : 'Back to sign in'}</Link>{mode === 'login' && <Link to="/account/forgot">Forgot password?</Link>}</div>
    </section></main>;
}
