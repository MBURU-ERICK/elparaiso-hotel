import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { customerApi, customerRequest } from '../customer/customerApi';
import { todayInNairobi, nextStayDate } from '../utils/stayDates';
export default function GuestBooking() {
  const [params] = useSearchParams();
  const [service, setService] = useState(params.get('service') || 'hotel');
  const [company, setCompany] = useState(false);
  const [facility, setFacility] = useState(params.get('facility') || '');
  const [facilities, setFacilities] = useState([]); const [catalogue, setCatalogue] = useState({ packages: [] });
  const [arrival, setArrival] = useState(params.get('check_in') || todayInNairobi());
  const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { Promise.all([customerApi.facilities(), customerRequest('/api/customers/conference-packages/')]).then(([f, c]) => { setFacilities(f.results || f); setCatalogue(c); }).catch(e => setError(e.message)); }, []);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { const response = await customerRequest('/api/customers/guest-reservations/', { method: 'POST', body: JSON.stringify({ ...data, service, company: company ? data.company : '' }) }); setNotice(`Thank you. Your request is ${response.reference}. Our team will confirm availability and pricing by email.`); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="guest-booking section"><div className="section-heading"><span className="eyebrow">YOUR NEXT GOOD MEMORY</span><h1>Let’s plan your visit.</h1><p>No account needed. Tell us what you have in mind and our team will reply by email.</p></div>{notice ? <div className="portal-panel" role="status"><h2>Your request is with us.</h2><p>{notice}</p><Link to="/">Explore Elparaiso →</Link></div> : <form className="portal-form portal-panel" onSubmit={submit}>
    {error && <p role="alert">{error}</p>}<div className="portal-form-grid"><label>Experience<select value={service} onChange={e => setService(e.target.value)}><option value="hotel">Hotel stay</option><option value="airbnb">Airbnb / private stay</option><option value="conference">Conference</option></select></label><label>Facility<select name="facility" value={facility} onChange={e => setFacility(e.target.value)} required><option value="">Choose a facility</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label></div>
    <label>Booking for<select value={company ? 'company' : 'individual'} onChange={e => setCompany(e.target.value === 'company')}><option value="individual">Myself / family</option><option value="company">A company / organisation</option></select></label>
    {company && <label>Company name<input name="company" maxLength={180} required /></label>}
    <div className="portal-form-grid"><label>{company ? 'Contact person' : 'Full name'}<input name="name" autoComplete="name" maxLength={150} required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" maxLength={30} required /></label><label>Number of guests<input name="guests" type="number" min="1" defaultValue={params.get('adults') || 1} required /></label><label>{service === 'conference' ? 'Event date' : 'Arrival'}<input name="start_date" type="date" min={todayInNairobi()} value={arrival} onChange={e => setArrival(e.target.value)} required /></label><label>{service === 'conference' ? 'Event end date' : 'Departure'}<input name="end_date" type="date" min={service === 'conference' ? arrival : nextStayDate(arrival)} defaultValue={params.get('check_out') || ''} required /></label></div>
    <label>{service === 'conference' ? 'Conference package' : 'Preferred room / stay'}{service === 'conference' ? <select name="selection" required><option value="">Select a package</option>{catalogue.packages.filter(p => String(p.facility) === facility).map(p => <option key={p.id} value={`${p.facility_name} — ${p.duration} day — KES ${p.price_per_guest}/guest`}>{p.facility_name} · {p.duration} day · KES {Number(p.price_per_guest).toLocaleString()}/guest</option>)}</select> : <input name="selection" defaultValue={params.get('selection') || ''} maxLength={200} />}</label>
    <label>Anything else we can arrange?<textarea name="requirements" rows="4" maxLength={5000} placeholder="Room preferences, catering, meeting layout or special requests" /></label><p>Requests are subject to availability. A booking is confirmed when our team replies with confirmation.</p><button disabled={busy || !facilities.length}>{busy ? 'Sending request…' : 'Send booking request →'}</button><small>Our team receives your request at elparaisohotelltd@gmail.com.</small>
  </form>}</main>;
}
