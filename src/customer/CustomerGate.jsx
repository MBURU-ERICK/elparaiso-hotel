import { Navigate, useLocation, Link } from 'react-router-dom';
import { useCustomer } from './context';
export default function CustomerGate({ children, verified = true }) {
  const { user, loading, error, refresh } = useCustomer();
  const location = useLocation();
  if (loading) return <main className="portal-state" role="status">Opening your secure workspace…</main>;
  if (error) return <main className="portal-state"><p role="alert">{error}</p><button onClick={refresh}>Try again</button></main>;
  if (!user) return <Navigate to={`/account/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (verified && !user.verified) return <main className="portal-state"><h1>Verify your email to continue</h1><p>Open the verification link sent to {user.email}. This helps keep your bookings and invoices private.</p><Link to="/account">Manage your account and resend the link</Link></main>;
  return children;
}
