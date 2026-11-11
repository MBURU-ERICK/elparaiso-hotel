import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { customerRequest } from '../customer/customerApi';
import { todayInNairobi, nextStayDate } from '../utils/stayDates';
import { estimateBooking } from '../utils/bookingQuote';
import BookingQuote from '../components/BookingQuote';
const emptyOptions = { facilities: [], rooms: [], packages: [], units: [] };
export default function GuestBooking() {
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => ({ service: ['hotel', 'airbnb', 'conference'].includes(params.get('service')) ? params.get('service') : 'hotel', facility: params.get('facility') || '', room_type: params.get('room_type') || '', unit: params.get('unit') || '', package: params.get('package') || '', occupancy: params.get('adults') === '2' ? '2' : '1', guests: params.get('adults') || '1', start_date: params.get('check_in') || todayInNairobi(), end_date: params.get('check_out') || '', add_accommodation: false, accommodation_guests: '1', accommodation_check_in: todayInNairobi(), accommodation_check_out: nextStayDate(todayInNairobi()) }));
  const [company, setCompany] = useState(false), [options, setOptions] = useState(emptyOptions);
  const [result, setResult] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    customerRequest('/api/customers/booking-options/').then(data => {
      if (!active) return;
      setOptions(data); setError('');
      setForm(old => {
        const selected = old.service === 'hotel' ? data.rooms.find(r => String(r.id) === old.room_type || r.name === params.get('selection')) : old.service === 'airbnb' ? data.units.find(u => String(u.id) === old.unit || u.name === params.get('selection')) : data.packages.find(p => String(p.id) === old.package);
        return selected ? { ...old, facility: String(selected.facility), ...(old.service === 'hotel' ? { room_type: String(selected.id) } : old.service === 'airbnb' ? { unit: String(selected.id) } : {}) } : old;
      });
    }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision, params]);
  function update(key, value) { setForm(old => ({ ...old, [key]: value, ...(['service', 'facility'].includes(key) ? { room_type: '', unit: '', package: '' } : {}) })); }
  function input(key, extra = {}) { return { name: key, value: form[key], onChange: e => update(key, e.target.value), ...extra }; }
  const quote = estimateBooking(form, options);
  const hotelStay = form.service === 'hotel' || (form.service === 'conference' && form.add_accommodation);
  const rooms = options.rooms.filter(r => form.service === 'conference' || String(r.facility) === form.facility);
  const facilityOptions = options.facilities.filter(f => form.service === 'hotel' ? options.rooms.some(r => r.facility === f.id) : form.service === 'airbnb' ? options.units.some(u => u.facility === f.id) : options.packages.some(p => p.facility === f.id));
  async function submit(event) {
    event.preventDefault(); if (!quote) { setError('Choose valid room/package options, occupancy, guest counts and dates to calculate your quote.'); return; }
    setBusy(true); setError('');
    const contact = Object.fromEntries(new FormData(event.currentTarget));
    const data = { ...contact, service: form.service, facility: form.facility, guests: form.guests, start_date: form.start_date, end_date: form.end_date, occupancy: form.occupancy, company: company ? contact.company : '' };
    if (form.service === 'hotel') data.room_type = form.room_type;
    if (form.service === 'airbnb') data.unit = form.unit;
    if (form.service === 'conference') {
      data.package = form.package;
      if (form.add_accommodation) Object.assign(data, { room_type: form.room_type, accommodation_guests: form.accommodation_guests, accommodation_check_in: form.accommodation_check_in, accommodation_check_out: form.accommodation_check_out });
    }
    // The server prices the selection again; the displayed estimate is never submitted as a price.
    try { setResult(await customerRequest('/api/customers/guest-reservations/', { method: 'POST', body: JSON.stringify(data) })); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="section booking-page"><header className="booking-page-heading"><span className="eyebrow">YOUR NEXT GOOD MEMORY</span><h1>Let’s plan your visit.</h1><p>No account needed. Select your experience and see the estimate before sending your request.</p></header>{result ? <div className="booking-page-grid"><div className="portal-panel" role="status"><h2>Your request is with us.</h2><p>Reference: {result.reference}</p><p>Your itemized quote has been queued by email. Our team will confirm availability.</p><Link to="/">Explore Elparaiso →</Link></div><BookingQuote quote={result.quote} /></div> : <div className="booking-page-grid"><form className="portal-form portal-panel" onSubmit={submit}>
    {error && <p className="portal-alert" role="alert">{error}</p>}{loading && <p role="status">Loading booking options…</p>}{!loading && !options.facilities.length && <button type="button" onClick={() => { setLoading(true); setRevision(n => n + 1); }}>Retry booking options</button>}
    <fieldset><legend>01 · Choose your experience</legend><div className="portal-form-grid"><label>Experience<select {...input('service')}><option value="hotel">Elparaiso hotel stay</option><option value="airbnb">Airbnb / private stay</option><option value="conference">Conference</option></select></label><label>Facility<select {...input('facility')} required><option value="">Choose a facility</option>{facilityOptions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label></div>
    {form.service === 'conference' && <label>Conference package<select {...input('package')} required><option value="">Select a package</option>{options.packages.filter(p => String(p.facility) === form.facility).map(p => <option key={p.id} value={p.id}>{p.duration === 'full' ? 'Full day' : 'Half day'} · KES {Number(p.price_per_guest).toLocaleString()}/guest/day</option>)}</select></label>}
    {form.service === 'airbnb' && <label>Airbnb room<select {...input('unit')} required><option value="">Select a room</option>{options.units.filter(u => String(u.facility) === form.facility).map(u => <option key={u.id} value={u.id}>{u.name} · up to {u.max_guests} guests · KES {Number(u.nightly_rate).toLocaleString()}/night</option>)}</select></label>}
    <div className="portal-form-grid"><label>Number of guests expected<input {...input('guests')} type="number" min="1" max="10000" required /></label><label>{form.service === 'conference' ? 'Event start date' : 'Arrival'}<input {...input('start_date')} type="date" min={todayInNairobi()} required /></label><label>{form.service === 'conference' ? 'Event end date (inclusive)' : 'Departure'}<input {...input('end_date')} type="date" min={form.service === 'conference' ? form.start_date : nextStayDate(form.start_date)} required /></label></div>
    {form.service === 'conference' && <p>Planning catering separately? <Link to="/conference-meals">Request an optional meals quotation →</Link></p>}
    {form.service === 'conference' && <label className="booking-checkbox"><input type="checkbox" checked={form.add_accommodation} onChange={e => update('add_accommodation', e.target.checked)} /> Add optional hotel rooms for conference guests</label>}
    {hotelStay && <fieldset><legend>{form.service === 'conference' ? 'Optional guest accommodation' : 'Your hotel room arrangement'}</legend><label>Hotel room category<select {...input('room_type')} required><option value="">Select a hotel room</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}{form.service === 'conference' ? ` · ${options.facilities.find(f => f.id === r.facility)?.name || 'Hotel'}` : ''}</option>)}</select></label><label>People per room<select {...input('occupancy')}><option value="1">One person · single occupancy</option><option value="2">Two people · double occupancy</option></select></label>{form.service === 'conference' && <><label>Guests requiring rooms<input {...input('accommodation_guests')} type="number" min="1" max={form.guests} required /></label><div className="portal-form-grid"><label>Accommodation arrival<input {...input('accommodation_check_in')} type="date" min={todayInNairobi()} required /></label><label>Accommodation departure<input {...input('accommodation_check_out')} type="date" min={nextStayDate(form.accommodation_check_in)} required /></label></div></>}<small>We calculate the number of rooms by dividing guests by people per room and rounding up. Each room uses the selected occupancy rate.</small></fieldset>}
    </fieldset><fieldset><legend>02 · Your contact details</legend><label>Booking for<select value={company ? 'company' : 'individual'} onChange={e => setCompany(e.target.value === 'company')}><option value="individual">Myself / family</option><option value="company">A company / organisation</option></select></label>{company && <label>Company name<input name="company" maxLength={180} required /></label>}<div className="portal-form-grid"><label>{company ? 'Contact person' : 'Full name'}<input name="name" autoComplete="name" maxLength={150} required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" maxLength={30} required /></label></div><label>Anything else we can arrange?<textarea name="requirements" rows="4" maxLength={5000} placeholder="Catering, meeting layout, accessibility or special requests" /></label></fieldset>
    <p>Requests are subject to availability. A booking is confirmed when our team replies with confirmation.</p><button disabled={busy || loading || !quote}>{busy ? 'Sending request…' : 'Send request & receive quote →'}</button><small>Our team receives your request at elparaisohotelltd@gmail.com.</small>
  </form><aside className="booking-quote-aside" aria-live="polite"><BookingQuote quote={quote} /><p className="booking-email-note">Your selected experience and itemized estimate will be included in your email. No payment is taken here.</p></aside></div>}</main>;
}
