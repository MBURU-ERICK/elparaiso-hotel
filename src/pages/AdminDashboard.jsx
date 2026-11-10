import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { staffApi, staffRequest } from '../services/staffApi';
const roles = [['Reception', 'Reservations, arrivals, departures and guest support'], ['Caretaker', 'Room readiness and operational availability'], ['Finance', 'Payments, reconciliation and statement reviews'], ['Manager', 'Facility operations, customers, quotations and gallery'], ['Administrator', 'Staff accounts, role assignments and room inventory']];
export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [types, setTypes] = useState([]);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (user.is_superuser) staffRequest('/api/staff/admin/room-types/').then(setTypes).catch(err => setError(err.message));
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
  return <main className="admin-dashboard"><p className="eyebrow">PROPERTY ADMINISTRATION</p><h1>Your property, in one place.</h1><p>Manage inventory and team access while staff focus on the guest experience.</p>
    <div className="admin-shortcuts"><Link to="/staff/rooms">Room inventory →</Link><Link to="/staff/gallery">Photo library →</Link><Link to="/staff/dashboard">Staff operations →</Link></div>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
    <div className="admin-grid"><form onSubmit={e => submit(e, 'rooms')}><h2>Add a room</h2><label>Room number<input name="room_number" required maxLength={20} /></label><label>Room type<select name="room_type" required defaultValue=""><option value="" disabled>Select an existing room type</option>{types.map(type => <option key={type.id} value={type.id}>{type.name} — KES {type.nightly_rate} (Facility {type.facility_id})</option>)}</select></label><label>Room image<input name="image" type="file" accept="image/*" /></label><label>Status<select name="status"><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label><button disabled={busy}>Create room</button></form>
    <form onSubmit={e => submit(e, 'users')}><h2>Create staff account</h2><label>Full name<input name="full_name" required autoComplete="name" /></label><label>Username<input name="username" required autoComplete="off" /></label><label>Email<input name="email" type="email" required /></label><label>Facility ID<input name="facility_id" type="number" min="1" required /></label><label>Role<select name="role">{roles.slice(0,4).map(([role]) => <option key={role} value={role.toLowerCase()}>{role}</option>)}</select></label><label>Initial password<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label><button disabled={busy}>Create staff account</button></form></div>
    <h2>Roles & responsibilities</h2><p>Role definitions below describe the intended access model. Server permissions remain authoritative.</p><div className="staff-table-scroll"><table><thead><tr><th>Role</th><th>Responsibilities</th></tr></thead><tbody>{roles.map(([role, description]) => <tr key={role}><th>{role}</th><td>{description}</td></tr>)}</tbody></table></div>
  </main>;
}
