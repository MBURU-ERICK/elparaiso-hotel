import { Link } from 'react-router-dom';
import { useCustomer } from './context';
import { usePortalResource } from './usePortalResource';
import { PortalState, Badge } from './PortalParts';
function Bookings() {
  const { data, loading, error, retry } = usePortalResource('bookings');
  return <section className="portal-panel"><h2>Your recent booking requests</h2><PortalState loading={loading} error={error} retry={retry} empty={data && !data.results.length} />{data?.results.map(item => <article className="portal-row" key={item.id}><div><strong>{item.kind === 'hotel' ? 'Hotel stay' : 'Airbnb stay'}</strong><p>{item.check_in} → {item.check_out}</p><small>Reference {item.reference}</small></div><Badge>{item.status}</Badge></article>)}</section>;
}
export default function CustomerOverview() {
  const { user } = useCustomer();
  return <><header className="portal-heading"><p className="eyebrow">WELCOME TO YOUR WORKSPACE</p><h1>Hello, {user.name.split(' ')[0]}.</h1><p>A little less admin. More time to look forward to your visit.</p></header>
    <div className="portal-actions-grid"><Link to="/rooms" className="portal-action-card"><span>YOUR NEXT GETAWAY</span><h2>Find your next stay</h2><p>Browse room photos, compare nightly rates and choose your dates.</p><strong>Explore stays →</strong></Link><Link to="/account/requests/new" className="portal-action-card"><span>01 / PLAN TOGETHER</span><h2>Request a quotation</h2><p>Group stays, conferences and tailored services.</p><strong>Start a request →</strong></Link><Link to="/account/invoices" className="portal-action-card"><span>02 / STAY ORGANISED</span><h2>Review your invoices</h2><p>Check the details, report a discrepancy and download a copy.</p><strong>View invoices →</strong></Link></div>
    {user.verified && <Bookings />}</>;
}
