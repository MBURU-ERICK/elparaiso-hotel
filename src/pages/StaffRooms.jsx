import { Link, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { staffApi, staffRequest } from '../services/staffApi';
export default function StaffRooms() {
  const { user } = useOutletContext();
  const [editing, setEditing] = useState(null);
  const [types, setTypes] = useState([]);

  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  useEffect(() => {
    if (user.is_superuser) staffRequest('/api/staff/admin/room-types/').then(setTypes).catch(err => setError(err.message));
  }, [user.is_superuser]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  useEffect(() => {
    let active = true;
    staffRequest(`/api/staff/rooms/?page=${page}`).then(result => { if (active) setData(result); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [page, refresh]);
  async function saveRoom(event) {
    event.preventDefault();
    const body = new FormData(event.currentTarget);
    if (!body.get('image')?.size) body.delete('image');
    setBusy(true); setError('');
    try {
      await staffApi.csrf();
      await staffRequest(`/api/staff/rooms/${editing.id}/`, { method: 'PATCH', body });
      setEditing(null); setRefresh(r => r + 1); setMessage('Room saved.');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function update() {
    setBusy(true); setError('');
    try {
      await staffApi.csrf();
      if (confirmation.remove) {
        await staffRequest(`/api/staff/rooms/${confirmation.room.id}/`, { method: 'DELETE' });
        setMessage(`Room ${confirmation.room.room_number} removed.`);
        setConfirmation(null);
        if (data.results.length === 1 && page > 1) setPage(p => p - 1);
        else setRefresh(r => r + 1);
        return;
      }
      const room = await staffRequest(`/api/staff/rooms/${confirmation.room.id}/`, { method: 'PATCH', body: JSON.stringify({ status: confirmation.status }) });
      setData(d => ({ ...d, results: d.results.map(r => r.id === room.id ? room : r) }));
      setMessage(`Room ${room.room_number} updated.`); setConfirmation(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="staff-rooms"><p className="eyebrow">ACCOMMODATION</p><h1>Room management</h1><p>Update operational availability. Guest occupancy is shown in the dashboard and reservations.</p>
    {user.is_superuser && <p><Link to="/staff/admin">Add a room →</Link></p>}
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {!data && !error && <p role="status">Loading rooms…</p>}
    {data && !data.results.length && <p>No rooms available for your facilities.</p>}
    {data && <div className="staff-table-scroll"><table><thead><tr><th>Room</th><th>Type</th><th>Operational status</th><th>Manage</th></tr></thead><tbody>{data.results.map(room => <tr key={room.id}><td>{room.room_number}{room.image && <img src={room.image} alt={`Room ${room.room_number}`} width="100" />}</td><td>{room.room_type}</td><td>{room.status}</td><td>{room.can_manage ? <select aria-label={`Operational status for room ${room.room_number}`} value={room.status} disabled={busy} onChange={event => setConfirmation({ room, status: event.target.value })}>{['available', 'maintenance', 'inactive'].map(status => <option key={status}>{status}</option>)}</select> : 'View only'}{user.is_superuser && <><button disabled={busy} onClick={() => setEditing(room)}>Edit room</button><button disabled={busy} onClick={() => setConfirmation({ room, remove: true })}>Remove room</button></>}</td></tr>)}</tbody></table></div>}
    {editing && <form key={editing.id} onSubmit={saveRoom}><h2>Edit room {editing.room_number}</h2><label>Room number<input name="room_number" required maxLength={20} defaultValue={editing.room_number} /></label><label>Room type<select name="room_type_id" required defaultValue={editing.room_type_id}><option value={editing.room_type_id}>{editing.room_type} (current)</option>{types.filter(t => t.facility_id === editing.facility_id && t.id !== editing.room_type_id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Floor<input name="floor" maxLength={30} defaultValue={editing.floor} /></label><label>Notes<textarea name="notes" defaultValue={editing.notes} /></label><label>Add or replace room image<input name="image" type="file" accept="image/*" /></label><button disabled={busy}>Save room</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button></form>}
    {confirmation && <div className="gallery-confirm" role="alertdialog" aria-modal="false" aria-labelledby="room-confirm"><h2 id="room-confirm">{confirmation.remove ? 'Remove' : 'Update'} room {confirmation.room.room_number}?</h2><p>{confirmation.remove ? "Permanently remove this room? Rooms with booking history must be marked inactive instead." : `Set operational status to ${confirmation.status}.`}</p><button disabled={busy} onClick={update}>Confirm</button><button disabled={busy} onClick={() => setConfirmation(null)}>Cancel</button></div>}
    {data?.count > 50 && <nav className="gallery-pagination" aria-label="Room pages"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page}</span><button disabled={page * 50 >= data.count} onClick={() => setPage(p => p + 1)}>Next</button></nav>}
  </main>;
}
