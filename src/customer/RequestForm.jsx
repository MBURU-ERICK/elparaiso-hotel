import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerApi } from './customerApi';
import { useCustomer } from './context';
export default function RequestForm() {
  const { user } = useCustomer(); const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [search] = useSearchParams();
  const [service, setService] = useState(() => ['conference', 'combined', 'dining', 'general'].includes(search.get('service')) ? search.get('service') : 'accommodation');
  useEffect(() => { let active = true; customerApi.facilities().then(data => { if (active) setFacilities(data); }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, []);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { const result = await customerApi.create(data); navigate(`/account/requests/${result.id}`); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <><header className="portal-heading"><p className="eyebrow">DESIGNED AROUND YOUR TEAM</p><h1>Tell us what you have in mind.</h1><p>Share the essentials. Our team will prepare a quotation and reply here, with updates by email.</p></header>
    <form className="portal-form portal-panel" onSubmit={submit}>{error && <p role="alert" className="portal-alert">{error}</p>}
      <label>Request title<input name="subject" placeholder="e.g. Annual team retreat for 30 guests" maxLength={180} required /></label>
      <div className="portal-form-grid"><label>Service<select name="service" value={service} onChange={event => setService(event.target.value)}><option value="accommodation">Bulk accommodation</option><option value="conference">Conference / meeting</option><option value="combined">Accommodation & conference</option><option value="dining">Dining / catering</option><option value="general">Other service</option></select></label>
      <label>Facility<select name="facility" required><option value="">Choose a facility</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label></div>
      <label>Company / organisation<input name="company" defaultValue={user.company} maxLength={180} autoComplete="organization" /></label>
      <div className="portal-form-grid"><label>{['accommodation', 'combined'].includes(service) ? 'Check-in date' : 'Start date'}<input name="start_date" type="date" required /></label><label>{['accommodation', 'combined'].includes(service) ? 'Check-out date' : 'End date'}<input name="end_date" type="date" required /></label><label>Number of guests<input name="guests" type="number" min="1" max="10000" defaultValue="10" required /></label><label>Rooms needed<input name="rooms" type="number" min={['accommodation', 'combined'].includes(service) ? 1 : 0} max="1000" defaultValue="5" required /></label></div>
      <label>What would make this work for your group?<textarea name="requirements" rows="6" maxLength={5000} placeholder="Room mix, meeting layout, catering, equipment, accessibility needs and any preferred arrangements." required /></label>
      <p className="portal-help">A request does not reserve rooms or a venue. Availability, pricing and arrangements are confirmed by our team.</p>
      <button className="portal-button" disabled={busy || !facilities.length}>{busy ? 'Sending request…' : 'Send quotation request →'}</button>
    </form></>;
}
