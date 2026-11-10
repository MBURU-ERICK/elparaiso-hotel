import { Link, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { staffApi, staffRequest } from '../services/staffApi';
export default function StaffRooms() {
  const { user } = useOutletContext();
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  useEffect(() => {
    let active = true;
    staffRequest(`/api/staff/rooms/?page=${page}`).then(result => { if (active) setData(result); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [page, refresh]);
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
    {data && <div className="staff-table-scroll"><table><thead><tr><th>Room</th><th>Type</th><th>Operational status</th><th>Manage</th></tr></thead><tbody>{data.results.map(room => <tr key={room.id}><td>{room.room_number}</td><td>{room.room_type}</td><td>{room.status}</td><td>{room.can_manage ? <select aria-label={`Operational status for room ${room.room_number}`} value={room.status} disabled={busy} onChange={event => setConfirmation({ room, status: event.target.value })}>{['available', 'maintenance', 'inactive'].map(status => <option key={status}>{status}</option>)}</select> : 'View only'}{user.is_superuser && <button disabled={busy} onClick={() => setConfirmation({ room, remove: true })}>Remove room</button>}</td></tr>)}</tbody></table></div>}
    {confirmation && <div className="gallery-confirm" role="alertdialog" aria-modal="false" aria-labelledby="room-confirm"><h2 id="room-confirm">{confirmation.remove ? 'Remove' : 'Update'} room {confirmation.room.room_number}?</h2><p>{confirmation.remove ? "Permanently remove this room? Rooms with booking history must be marked inactive instead." : `Set operational status to ${confirmation.status}.`}</p><button disabled={busy} onClick={update}>Confirm</button><button disabled={busy} onClick={() => setConfirmation(null)}>Cancel</button></div>}
    {data?.count > 50 && <nav className="gallery-pagination" aria-label="Room pages"><button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page}</span><button disabled={page * 50 >= data.count} onClick={() => setPage(p => p + 1)}>Next</button></nav>}
  </main>;
}
