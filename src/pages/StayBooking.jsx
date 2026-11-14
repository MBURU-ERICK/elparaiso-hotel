import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { customerRequest } from '../customer/customerApi';
import { checkAvailability, getRoomTypes } from '../services/bookingApi';
import { todayInNairobi, nextStayDate } from '../utils/stayDates';
import { estimateBooking, stayNights } from '../utils/bookingQuote';
import { validateStaySearch, validateGuestDetails } from '../utils/reservationValidation';
import { HomePhoto } from '../components/HomeLive';
import { PageHero } from '../components/Premium';
import ContactLinks from '../components/ContactLinks';
import BookingQuote from '../components/BookingQuote';
import SEO from '../components/SEO';
import GuestBooking from './GuestBooking';
import '../styles/reservation.css';
const steps = ['Dates', 'Accommodation', 'Guest details', 'Review', 'Request received'];
export default function StayBooking() {
  const [params] = useSearchParams();
  return ['event', 'conference'].includes(params.get('service')) ? <GuestBooking /> : <StayWizard />;
}
function StayWizard() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({ service: params.get('service') === 'airbnb' ? 'airbnb' : 'hotel', facility: params.get('facility') || '', room_type: params.get('room_type') || '', unit: params.get('unit') || '', start_date: params.get('check_in') || todayInNairobi(), end_date: params.get('check_out') || nextStayDate(todayInNairobi()), guests: params.get('adults') || '2', children: params.get('children') || '0', requested_rooms: params.get('rooms') || '1', occupancy: Number(params.get('adults') || '2') > 1 ? '2' : '1' }));
  const [guest, setGuest] = useState({ first: '', last: '', email: '', phone: '+254', requirements: '', company: '' });
  const [options, setOptions] = useState(null), [catalogue, setCatalogue] = useState([]), [available, setAvailable] = useState(null);
  const [error, setError] = useState(''), [errors, setErrors] = useState({}), [searching, setSearching] = useState(false), [sending, setSending] = useState(false), [result, setResult] = useState(null), [revision, setRevision] = useState(0);
  const [companyBooking, setCompanyBooking] = useState(false);
  const [compared, setCompared] = useState([]);
  const idempotency = useRef(null), heading = useRef(null);
  useEffect(() => {
    let active = true;
    customerRequest('/api/customers/booking-options/', { signal: AbortSignal.timeout(15000) }).then(data => { if (active) setOptions({ facilities: [], rooms: [], units: [], ...data }); }).catch(() => { if (active) setError('We couldn’t retrieve booking options. Retry or speak with our team.'); });
    // Photography is supplementary; a missing public catalogue never blocks a request.
    getRoomTypes().then(data => { if (active) setCatalogue(Array.isArray(data) ? data : data.results || []); }).catch(() => {});
    return () => { active = false; };
  }, [revision]);
  useEffect(() => { if (step > 0) heading.current?.focus(); }, [step]);
  function update(key, value) { setForm(old => ({ ...old, [key]: value })); setErrors({}); }
  const choices = options ? (form.service === 'hotel' ? options.rooms : options.units) || [] : [];
  const selected = choices.find(room => String(room.id) === (form.service === 'hotel' ? form.room_type : form.unit));
  const photoFor = room => room?.image_url || room?.images?.[0]?.image_url || (typeof room?.images?.[0] === 'string' ? room.images[0] : '') || (form.service === 'hotel' ? catalogue.find(item => item.id === room?.id)?.image_url : '');
  const quote = options ? estimateBooking(form, options) : null;
  const selectedAvailability = available?.find(room => String(room.id) === String(selected?.id));
  const selectionAllowed = !!selected && !!quote && (!selectedAvailability || selectedAvailability.available_rooms >= Math.ceil(Number(form.guests) / Number(form.occupancy)));
  const nights = stayNights(form.start_date, form.end_date);
  async function search(event) {
    event.preventDefault();
    const found = validateStaySearch(form, todayInNairobi()); setErrors(found);
    if (Object.keys(found).length) return;
    setSearching(true); setError(''); setAvailable(null);
    if (form.service === 'hotel') {
      try { setAvailable((await checkAvailability(form.start_date, form.end_date)).room_types || []); }
      catch { setError('Live availability could not be checked. You can still request a room; our team will confirm availability.'); }
    }
    setSearching(false); setStep(1);
    window.dispatchEvent(new CustomEvent('hotel:analytics', { detail: { event: 'booking-start', source: 'booking' } }));
  }
  function select(room) { setForm(old => ({ ...old, facility: String(room.facility), [form.service === 'hotel' ? 'room_type' : 'unit']: String(room.id) })); }
  async function send() {
    if (sending || !selectionAllowed) return;
    const guestErrors = validateGuestDetails(guest, companyBooking);
    if (Object.keys(guestErrors).length) { setErrors(guestErrors); setStep(2); return; }
    if (Object.keys(validateStaySearch(form, todayInNairobi())).length) { setError('Please review your dates and guest numbers before sending.'); setStep(0); return; }
    setSending(true); setError('');
    const data = { service: form.service, facility: form.facility, guests: form.guests, start_date: form.start_date, end_date: form.end_date, occupancy: form.occupancy, company: companyBooking ? guest.company.trim() : '', name: `${guest.first.trim()} ${guest.last.trim()}`, email: guest.email.trim(), phone: guest.phone.trim(), requirements: `Requested arrangement: ${form.guests} adults, ${form.children} children, ${form.requested_rooms} rooms. Please confirm child rates and suitable room arrangement.\n${guest.requirements}` };
    data[form.service === 'hotel' ? 'room_type' : 'unit'] = form.service === 'hotel' ? form.room_type : form.unit;
    const payload = JSON.stringify(data);
    if (idempotency.current?.payload !== payload) idempotency.current = { payload, key: crypto.randomUUID() };
    try {
      const response = await customerRequest('/api/customers/guest-reservations/', { method: 'POST', body: JSON.stringify({ ...data, submission_key: idempotency.current.key }) });
      setResult(response); setStep(4);
      window.dispatchEvent(new CustomEvent('hotel:analytics', { detail: { event: 'booking-submit', service: form.service } }));
    } catch (e) { setError(e.name === 'TimeoutError' ? 'We could not verify whether your request was received. Retry with the same details or contact our team before making another request.' : e.message || 'Your request could not be sent. Your details remain here; please retry.'); }
    finally { setSending(false); }
  }
  return <main className="reservation-page"><SEO title="Request Your Stay at Elparaiso Hotel" description="Choose dates, compare real room rates and send your stay request to Elparaiso Hotel, Rumuruti. Our team confirms availability and pricing by email." path="/booking" noindex /><PageHero title="Your Perfect Stay Begins Here" copy="Escape into comfort, discover peaceful surroundings, and reserve your memorable experience at Elparaiso Hotel." category="rooms" to="/rooms" action="Explore accommodation" />
    <section className="reservation-container"><ol className="reservation-progress" aria-label="Booking progress">{steps.map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined} className={i < step ? 'is-complete' : ''}><span>{i < step ? '✓' : i + 1}</span>{i < step && step < 4 ? <button onClick={() => { setError(''); setStep(i); }}>{label}</button> : <strong>{label}</strong>}</li>)}</ol>
    <div className="reservation-layout"><div className="reservation-panel"><h2 ref={heading} tabIndex={-1}>{step === 0 ? 'When can we welcome you?' : step === 1 ? 'Find your kind of stay.' : step === 2 ? 'A few details, then you’re ready.' : step === 3 ? 'Take a moment to review.' : 'Your request is with us.'}</h2>{error && <p className="reservation-alert" role="alert">{error}</p>}
    {!options && <div>{error ? <button className="premium-button" onClick={() => { setError(''); setRevision(n => n + 1); }}>Retry booking options</button> : <div className="reservation-skeleton" role="status" aria-label="Retrieving booking options" />}<p>Prefer a conversation? <ContactLinks /></p></div>}
    {step === 0 && <form onSubmit={search} className="reservation-form"><label>Stay type<select value={form.service} onChange={e => setForm(old => ({ ...old, service: e.target.value, room_type: '', unit: '', facility: '' }))}><option value="hotel">Hotel rooms</option><option value="airbnb">Private stays</option></select></label><div className="reservation-fields">{[['start_date','Check-in','date'],['end_date','Check-out','date'],['guests','Adults','number'],['children','Children','number'],['requested_rooms','Preferred rooms','number']].map(([key,label,type]) => <label key={key}>{label}<input type={type} value={form[key]} onChange={e => update(key,e.target.value)} required min={type === 'date' ? (key === 'end_date' ? nextStayDate(form.start_date) : todayInNairobi()) : key === 'children' ? 0 : 1} max={type === 'number' ? 100 : undefined} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />{errors[key] && <small id={`${key}-error`} role="alert">{errors[key]}</small>}</label>)}</div><p className="reservation-help">Child arrangements and preferred room counts are requests. The current pricing model calculates rooms from adult numbers and occupancy; our team confirms the final family arrangement.</p><button className="premium-button" disabled={!options || searching}>{searching ? 'Checking availability…' : 'Search availability →'}</button><Link to="/booking?service=conference">Planning a conference?</Link></form>}
    {step === 1 && options && <><div className="reservation-fields"><label>People per room<select value={form.occupancy} onChange={e => setForm(old => ({ ...old, occupancy: e.target.value, room_type: '', unit: '', facility: '' }))}><option value="1">Single occupancy</option><option value="2">Double occupancy</option></select></label></div><div className="reservation-room-grid">{choices.map(room => {
      const availability = available?.find(row => String(row.id) === String(room.id));
      const needed = Math.ceil(Number(form.guests) / Number(form.occupancy));
      const capacity = form.service === 'hotel' ? Number(form.occupancy) <= room.max_occupancy : Number(form.guests) <= room.max_guests;
      const candidate = { ...form, facility: String(room.facility), [form.service === 'hotel' ? 'room_type' : 'unit']: String(room.id) };
      const price = estimateBooking(candidate, options);
      const blocked = !capacity || (availability && availability.available_rooms < needed);
      return <article className={`reservation-room${selected?.id === room.id ? ' is-selected' : ''}`} key={room.id}><HomePhoto src={photoFor(room)} alt={room.name} /><div><span className="premium-pill">{form.service === 'hotel' ? 'HOTEL ROOM' : 'PRIVATE STAY'}</span><h3>{room.name}</h3><p>Up to {room.max_occupancy || room.max_guests} guests {form.service === 'hotel' ? 'per room' : 'per unit'}</p><p>{availability ? `${availability.available_rooms} rooms currently available` : 'Availability confirmed by our team'}</p><p>{price?.lines?.[0] ? `KES ${Number(price.lines[0].unit_price).toLocaleString('en-KE')} / ${form.service === 'hotel' ? 'room' : 'unit'} / night` : 'Rate on request — contact our team'}</p><details><summary>View details</summary><p>{room.description || (form.service === 'hotel' ? catalogue.find(item => item.id === room.id)?.description : '') || 'Ask our team about amenities and bed arrangements.'}</p><ul className="room-amenities" aria-label="Room amenities">{(Array.isArray(room.amenities) ? room.amenities : []).filter(item => typeof item === 'string').map(item => <li key={item}>{item}</li>)}</ul><p>Check-in times and cancellation terms are confirmed by our team before booking.</p></details><label className="reservation-compare"><input type="checkbox" checked={compared.includes(room.id)} onChange={e => setCompared(old => e.target.checked ? [...old, room.id] : old.filter(id => id !== room.id))} /> Compare</label><button type="button" className="premium-button" disabled={blocked || !price} aria-pressed={selected?.id === room.id} onClick={() => select(room)}>{blocked ? 'Not suitable for this search' : !price ? 'Contact us for pricing' : selected?.id === room.id ? 'Selected ✓' : 'Select room'}</button></div></article>;
    })}</div>{!choices.length && <p>No accommodation is currently listed. <Link to="/contact">Ask our team about your dates.</Link></p>}{compared.length > 1 && <div className="reservation-comparison" role="region" aria-label="Room comparison" tabIndex={0}><table><caption>Your room comparison</caption><thead><tr><th>Stay</th><th>Capacity</th><th>Nightly rate</th></tr></thead><tbody>{choices.filter(room => compared.includes(room.id)).map(room => { const q = estimateBooking({ ...form, facility: String(room.facility), [form.service === 'hotel' ? 'room_type' : 'unit']: String(room.id) }, options); return <tr key={room.id}><th>{room.name}</th><td>{room.max_occupancy || room.max_guests}</td><td>{q?.lines?.[0] ? `KES ${q.lines[0].unit_price}` : 'On request'}</td></tr>; })}</tbody></table></div>}<div className="reservation-actions"><button onClick={() => setStep(0)} type="button">← Dates</button><button className="premium-button" disabled={!selectionAllowed} onClick={() => setStep(2)}>Continue →</button></div></>}
    {step === 2 && <form className="reservation-form" onSubmit={e => { e.preventDefault(); const found = validateGuestDetails(guest, companyBooking); setErrors(found); if (Object.keys(found).length) return; setError(''); setStep(3); }}><label>Booking for<select value={companyBooking ? 'company' : 'individual'} onChange={e => setCompanyBooking(e.target.value === 'company')}><option value="individual">Myself / family</option><option value="company">Company / organisation</option></select></label>{companyBooking && <label>Company name<input value={guest.company} onChange={e => setGuest(old => ({ ...old, company: e.target.value }))} maxLength="180" required /></label>}<div className="reservation-fields">{[['first','First name','text','given-name'],['last','Surname','text','family-name'],['email','Email','email','email'],['phone','Phone','tel','tel']].map(([key,label,type,auto]) => <label key={key}>{label}<input type={type} autoComplete={auto} value={guest[key]} onChange={e => setGuest(old => ({ ...old,[key]:e.target.value }))} minLength={type === 'tel' ? 7 : 2} maxLength={type === 'tel' ? 30 : 150} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `guest-${key}-error` : undefined} required />{errors[key] && <small id={`guest-${key}-error`} role="alert">{errors[key]}</small>}</label>)}</div><label>Special requests<textarea rows="4" maxLength="4000" value={guest.requirements} onChange={e => setGuest(old => ({ ...old,requirements:e.target.value }))} /></label><p className="reservation-help">Use your international phone number, for example +254 followed by your Kenyan number without the leading zero.</p><div className="reservation-actions"><button type="button" onClick={() => setStep(1)}>← Accommodation</button><button className="premium-button">Review request →</button></div></form>}
    {step === 3 && <><dl className="reservation-review">{companyBooking && <><dt>Company</dt><dd>{guest.company}</dd></>}<dt>Guest</dt><dd>{guest.first} {guest.last}</dd><dt>Email</dt><dd>{guest.email}</dd><dt>Phone</dt><dd>{guest.phone}</dd><dt>Special requests</dt><dd>{guest.requirements || 'None added'}</dd></dl><p>We’ll reply by email with availability and your quotation. Sending this request does not confirm a reservation or take payment. Ask us about cancellation terms, arrival times and any fees before confirming.</p><div className="reservation-actions"><button type="button" disabled={sending} onClick={() => setStep(2)}>← Guest details</button><button type="button" className="premium-button" disabled={sending || !selectionAllowed} onClick={send}>{sending ? 'Sending request…' : 'Send Booking Request'}</button></div></>}
    {step === 4 && result && <div role="status"><p>Thank you, {guest.first}. Your booking request was received.</p>{(result.booking_code || result.reference) && <p><strong>Request reference: {result.booking_code || result.reference}</strong></p>}<p>Our team will confirm availability and reply by email. Your booking is confirmed only when our team confirms it.</p><Link className="premium-button" to="/">Explore Elparaiso</Link></div>}
    </div><aside className="reservation-summary"><details open><summary>Your stay at a glance</summary>{selected && <><HomePhoto src={photoFor(selected)} alt={selected.name} /><h3>{selected.name}</h3></>}<dl><dt>Arrival</dt><dd>{form.start_date}</dd><dt>Departure</dt><dd>{form.end_date}</dd><dt>Nights</dt><dd>{nights || '—'}</dd><dt>Adults / children</dt><dd>{form.guests} / {form.children}</dd><dt>Preferred rooms</dt><dd>{form.requested_rooms} (request)</dd></dl><BookingQuote quote={result?.quote || quote} title={result?.quote ? 'Your returned quotation' : 'Your estimated quote'} /><p className="reservation-help">The estimate follows supported adult occupancy rates. Child pricing, requested arrangements and any additional charges need team confirmation.</p></details></aside></div></section>
    <section className="premium-section tint"><h2>Experience the Warmth of Elparaiso</h2><p>Comfortable stays, time around the table and room to relax in the garden. Prefer a personal conversation? Speak directly with our team.</p><ContactLinks whatsapp /></section></main>;
}
