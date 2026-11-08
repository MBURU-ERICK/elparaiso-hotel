import './packages.css';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerApi } from './customerApi';
import { useCustomer } from './context';
export default function RequestForm() {
  const { user } = useCustomer(); const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [catalogue, setCatalogue] = useState({ rooms: [], packages: [], images: [] });
  const [facility, setFacility] = useState(''); const [guests, setGuests] = useState(10); const [roomCount, setRoomCount] = useState(10); const [roomId, setRoomId] = useState(''); const [packageId, setPackageId] = useState(''); const [dates, setDates] = useState({ start: '', end: '' });
  const [search] = useSearchParams();
  const [service, setService] = useState(() => ['conference', 'combined', 'dining', 'general'].includes(search.get('service')) ? search.get('service') : 'accommodation');
  useEffect(() => { let active = true; Promise.all([customerApi.facilities(), customerApi.catalogue()]).then(([data, options]) => { if (active) { setFacilities(data); setCatalogue(options); } }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, []);
  const hasRooms = ['accommodation', 'combined'].includes(service);
  const hasConference = ['conference', 'combined'].includes(service);
  const rooms = catalogue.rooms.filter(room => room.facility === Number(facility));
  const packages = catalogue.packages.filter(pkg => pkg.facility === Number(facility));
  const room = rooms.find(item => item.id === Number(roomId));
  const pkg = packages.find(item => item.id === Number(packageId));
  const nights = dates.start && dates.end ? Math.max(0, Math.round((Date.parse(dates.end) - Date.parse(dates.start)) / 86400000)) : 0;
  const roomTotal = hasRooms && room ? Number(room.nightly_rate) * Number(roomCount) * nights : 0;
  const conferenceTotal = hasConference && pkg ? Number(pkg.price_per_guest) * Number(guests) : 0;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.rooms = hasRooms ? Number(roomCount) : 0;
    if (hasRooms) data.room_type = Number(roomId);
    if (hasConference) data.conference_package = Number(packageId);
    try { const result = await customerApi.create(data); navigate(`/account/requests/${result.id}`); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <><header className="portal-heading"><p className="eyebrow">DESIGNED AROUND YOUR TEAM</p><h1>Tell us what you have in mind.</h1><p>Share the essentials. Our team will prepare a quotation and reply here, with updates by email.</p></header>
    <form className="portal-form portal-panel" onSubmit={submit}>{error && <p role="alert" className="portal-alert">{error}</p>}
      <label>Request title<input name="subject" placeholder="e.g. Annual team retreat for 30 guests" maxLength={180} required /></label>
      <div className="portal-form-grid"><label>Service<select name="service" value={service} onChange={event => setService(event.target.value)}><option value="accommodation">Bulk accommodation</option><option value="conference">Conference / meeting</option><option value="combined">Accommodation & conference</option><option value="dining">Dining / catering</option><option value="general">Other service</option></select></label>
      <label>Facility<select name="facility" value={facility} onChange={event => { setFacility(event.target.value); setRoomId(''); setPackageId(''); }} required><option value="">Choose a facility</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label></div>
      <label>Company / organisation<input name="company" defaultValue={user.company} maxLength={180} autoComplete="organization" /></label>
      <div className="portal-form-grid"><label>{['accommodation', 'combined'].includes(service) ? 'Check-in date' : 'Start date'}<input name="start_date" type="date" value={dates.start} onChange={e => setDates(previous => ({ ...previous, start: e.target.value }))} required /></label><label>{['accommodation', 'combined'].includes(service) ? 'Check-out date' : 'End date'}<input name="end_date" type="date" value={dates.end} onChange={e => setDates(previous => ({ ...previous, end: e.target.value }))} required /></label><label>Number of guests<input name="guests" type="number" min="1" max="10000" value={guests} onChange={e => setGuests(e.target.value)} required /></label><label>Rooms needed<input name="rooms" type="number" min={['accommodation', 'combined'].includes(service) ? 1 : 0} max="1000" value={hasRooms ? roomCount : 0} onChange={e => setRoomCount(e.target.value)} disabled={!hasRooms} required /></label></div>
      {hasRooms && <fieldset className="package-picker"><legend>Select your room category</legend><p>Room prices are per room, per night. Choose the number of rooms separately from guests.</p><div className="package-grid">{rooms.map(item => <label className="package-card" key={item.id}>{item.image_url && <img src={item.image_url} alt={item.name} loading="lazy" />}<input type="radio" name="room_choice" value={item.id} checked={roomId === String(item.id)} onChange={e => setRoomId(e.target.value)} required /><strong>{item.name}</strong><span>KSh {Number(item.nightly_rate).toLocaleString()} / room / night</span><span>Up to {item.max_occupancy} guests per room</span><p>{item.description}</p></label>)}</div>{!rooms.length && <p>Select a facility with active room categories.</p>}{room && <p>{roomCount} × {room.name} × {nights} nights = KSh {roomTotal.toLocaleString()}. {Number(guests) > Number(roomCount) * room.max_occupancy && 'Please select more rooms for this group.'}</p>}</fieldset>}
      {hasConference && <fieldset className="package-picker"><legend>Choose your conference package</legend><p>Prices cover one conference session per guest. Additional sessions are quoted by our team.</p><div className="package-grid">{packages.map(item => <label className="package-card" key={item.id}>{item.image_url && <img src={item.image_url} alt={`${item.facility_name} conference hall`} loading="lazy" />}<input type="radio" name="package_choice" value={item.id} checked={packageId === String(item.id)} onChange={e => setPackageId(e.target.value)} required /><strong>{item.duration === 'half' ? 'Half day' : 'Full day'} conference</strong><span>KSh {Number(item.price_per_guest).toLocaleString()} / guest</span><p className="preserve-lines">{item.offerings || 'Contact our team to confirm package inclusions.'}</p></label>)}</div>{!packages.length && <p>Select a facility with an active conference package.</p>}{pkg && <p>{guests} guests × KSh {Number(pkg.price_per_guest).toLocaleString()} = KSh {conferenceTotal.toLocaleString()}</p>}</fieldset>}
      {(hasRooms || hasConference) && <section className="package-estimate" aria-live="polite"><h2>Estimated total: KSh {(roomTotal + conferenceTotal).toLocaleString()}</h2><p>Subject to availability, occupancy supplements and staff quotation.</p></section>}
      <label>What would make this work for your group?<textarea name="requirements" rows="6" maxLength={5000} placeholder="Room mix, meeting layout, catering, equipment, accessibility needs and any preferred arrangements." required /></label>
      <p className="portal-help">A request does not reserve rooms or a venue. Availability, pricing and arrangements are confirmed by our team.</p>
      <button className="portal-button" disabled={busy || !facilities.length || (hasRooms && (!room || nights < 1 || Number(guests) > Number(roomCount) * room.max_occupancy)) || (hasConference && !pkg)}>{busy ? 'Sending request…' : 'Send quotation request →'}</button>
    </form></>;
}
