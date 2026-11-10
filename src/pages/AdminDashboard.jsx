import { customerApi } from '../customer/customerApi';
import { hotelFacilities, defaultHotelFacility } from '../utils/hotelFacilities';
import WorkspaceHeader from '../components/WorkspaceHeader';
import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { staffApi, staffRequest } from '../services/staffApi';
const roles = [['Reception', 'Reservations, arrivals, departures and guest support'], ['Caretaker', 'Room readiness and operational availability'], ['Finance', 'Payments, reconciliation and statement reviews'], ['Manager', 'Facility operations, customers, quotations and gallery'], ['Administrator', 'Staff accounts, role assignments and room inventory']];
export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [types, setTypes] = useState([]), [facilities, setFacilities] = useState([]), [hotelFacility, setHotelFacility] = useState('');

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (user.is_superuser) Promise.all([staffRequest('/api/staff/admin/room-types/'), customerApi.facilities()]).then(([rows, f]) => { setTypes(rows.results || rows); setFacilities(f); setHotelFacility(defaultHotelFacility(f)); }).catch(err => setError(err.message));
  }, [user.is_superuser]);
  if (!user.is_superuser) return <main><h1>Administrator access required</h1><Link to="/staff/dashboard">Return to staff workspace</Link></main>;
  async function submit(event, kind) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = kind === 'rooms' ? new FormData(form) : Object.fromEntries(new FormData(form));
    if (kind === 'rooms' && !payload.get('image')?.size) payload.delete('image');
    setBusy(true); setError(''); setMessage('');
    try {
      await staffApi.csrf();
      await staffRequest(`/api/staff/admin/${kind}/`, { method: 'POST', body: kind === 'rooms' ? payload : JSON.stringify(payload) });
      setMessage(kind === 'users' ? 'Staff account created.' : 'Room created.'); form.reset();
    } catch (err) { setError(err.status === 404 ? 'This administration endpoint is not available on the server yet. No changes were saved.' : err.message); }
    finally { setBusy(false); }
  }
  return <main className="admin-dashboard"><WorkspaceHeader eyebrow="YOUR PROPERTY & PEOPLE" title="Administration" description="Grow your room collection and give your team the access they need." actions={<Link className="portal-button" to="/staff/rooms">Manage hotel rooms →</Link>} />
    <div className="operations-tools"><Link to="/staff/rooms"><h3>Hotel room collection</h3><p>Photos, availability and room details.</p></Link><Link to="/staff/airbnb/rooms"><h3>Airbnb collection</h3><p>Add private stays and upload room photos.</p></Link><Link to="/staff/gallery"><h3>Photo library</h3><p>Curate your property photographs.</p></Link><Link to="/staff/packages"><h3>Conference packages</h3><p>Keep rates and inclusions current.</p></Link></div>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
    <div className="admin-grid"><form className="portal-form workspace-panel" onSubmit={e => submit(e, 'rooms')}><h2>Add a room</h2><label>Hotel facility<select name="facility_id" value={hotelFacility} onChange={e => setHotelFacility(e.target.value)} required><option value="">Select a hotel</option>{hotelFacilities(facilities).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label>Room number<input name="room_number" required maxLength={20} /></label><label>Room type<select name="room_type" key={hotelFacility} required defaultValue=""><option value="" disabled>Select an existing room type</option>{types.filter(type => String(type.facility_id) === hotelFacility && type.is_active !== false).map(type => <option key={type.id} value={type.id}>{type.name} — KES {type.nightly_rate} · {type.facility_name || facilities.find(f => f.id === type.facility_id)?.name}</option>)}</select><Link to="/staff/room-categories">Add or edit categories and rates →</Link></label><label>Room image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label><label>Status<select name="status"><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label><button disabled={busy}>Create room</button></form>
    <form className="portal-form workspace-panel" onSubmit={e => submit(e, 'users')}><h2>Create staff account</h2><label>Full name<input name="full_name" required autoComplete="name" /></label><label>Username<input name="username" required autoComplete="off" /></label><label>Email<input name="email" type="email" required /></label><label>Facility<select name="facility_id" required defaultValue=""><option value="">Choose a facility</option>{facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label>Role<select name="role">{roles.slice(0,4).map(([role]) => <option key={role} value={role.toLowerCase()}>{role}</option>)}</select></label><label>Initial password<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label><button disabled={busy}>Create staff account</button></form></div>
    <section className="workspace-panel"><div className="workspace-panel-heading"><h2>Roles & responsibilities</h2></div><div className="staff-role-grid">{roles.map(([role, description]) => <article key={role}><span className="eyebrow">TEAM ACCESS</span><h3>{role}</h3><p>{description}</p></article>)}</div></section>
  </main>;
}
