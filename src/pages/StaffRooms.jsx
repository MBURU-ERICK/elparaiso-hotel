import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BedDouble, Users, Plus, Pencil, Image, Building2, Trash2, DoorOpen, Wrench, Search } from 'lucide-react';
import { staffApi, staffRequest } from '../services/staffApi';
import WorkspaceHeader from '../components/WorkspaceHeader';
import RoomPhotoPicker from '../components/RoomPhotoPicker';
const statuses = [['available', 'Available'], ['maintenance', 'Maintenance'], ['inactive', 'Inactive']];
const money = amount => amount === null || amount === undefined ? 'Not configured' : `KES ${Number(amount).toLocaleString()}`;
export default function StaffRooms() {
  const { user } = useOutletContext();
  const [editing, setEditing] = useState(null), [types, setTypes] = useState([]), [files, setFiles] = useState([]), [editorKey, setEditorKey] = useState(0);
  const [refresh, setRefresh] = useState(0), [data, setData] = useState(null), [page, setPage] = useState(1), [error, setError] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [confirmation, setConfirmation] = useState(null);
  const [search, setSearch] = useState(''), [filter, setFilter] = useState('');
  useEffect(() => { let active = true; if (user.is_superuser) staffRequest('/api/staff/admin/room-types/').then(rows => { if (active) setTypes(rows); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [user.is_superuser]);
  useEffect(() => { let active = true; staffRequest(`/api/staff/rooms/?page=${page}`).then(result => { if (active) { setData(result); setError(''); } }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [page, refresh]);
  function edit(room) { setEditing(room); setFiles([]); setEditorKey(n => n + 1); setMessage(''); setError(''); }
  async function saveRoom(event) {
    event.preventDefault(); const body = new FormData(event.currentTarget);
    if (files[0]) body.set('image', files[0]);
    if (!editing.id) { body.set('room_type', body.get('room_type_id')); body.delete('room_type_id'); }
    setBusy(true); setError('');
    try {
      await staffApi.csrf();
      await staffRequest(editing.id ? `/api/staff/rooms/${editing.id}/` : '/api/staff/admin/rooms/', { method: editing.id ? 'PATCH' : 'POST', body });
      setEditing(null); setFiles([]); setRefresh(n => n + 1); setMessage(editing.id ? 'Room details and photo saved.' : 'Hotel room created.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function update() {
    setBusy(true); setError('');
    try {
      await staffApi.csrf();
      if (confirmation.remove) {
        await staffRequest(`/api/staff/rooms/${confirmation.room.id}/`, { method: 'DELETE' });
        setMessage(`Room ${confirmation.room.room_number} removed.`);
        if (editing?.id === confirmation.room.id) setEditing(null);
        if (data.results.length === 1 && page > 1) setPage(n => n - 1); else setRefresh(n => n + 1);
      } else {
        const room = await staffRequest(`/api/staff/rooms/${confirmation.room.id}/`, { method: 'PATCH', body: JSON.stringify({ status: confirmation.status }) });
        setData(old => ({ ...old, results: old.results.map(r => r.id === room.id ? room : r) })); setMessage(`Room ${room.room_number} updated.`);
      }
      setConfirmation(null);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const visible = data?.results.filter(room => (!filter || room.status === filter) && `${room.room_number} ${room.room_type} ${room.facility_name} ${room.floor}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="staff-rooms room-collection-page"><WorkspaceHeader eyebrow="YOUR HOTEL ROOM COLLECTION" title="Hotel room management" description="A clear view of every room. Keep photos, room details and operational availability ready for your next guest." actions={user.is_superuser && <button className="portal-button" onClick={() => edit({})}><Plus size={17} /> Add hotel room</button>} />
    {error && <p role="alert" className="portal-alert">{error}<button onClick={() => setRefresh(n => n + 1)}>Retry</button></p>}{message && <p role="status" className="portal-notice">{message}</p>}
    <div className="workspace-panel unit-toolbar"><div><Building2 size={22} /><strong>{data?.count ?? '—'} hotel rooms in your collection</strong></div><span className="workspace-caption">Room status controls availability. Guest occupancy is tracked in reservations.</span></div>
    {data && <div className="collection-summary-grid">{[[DoorOpen, 'Available', 'available'], [Wrench, 'Maintenance', 'maintenance'], [BedDouble, 'Inactive', 'inactive']].map(([Icon, title, value]) => <button className={`collection-summary-card ${filter === value ? 'is-selected' : ''}`} key={value} onClick={() => setFilter(filter === value ? '' : value)} aria-pressed={filter === value}><Icon size={22} /><strong>{data.results.filter(r => r.status === value).length}</strong><span>{title} on this page</span></button>)}</div>}
    {editing && <section className="workspace-panel unit-editor"><div className="workspace-panel-heading"><div><span className="eyebrow">CURATE YOUR NEXT WELCOME</span><h2>{editing.id ? `Edit room ${editing.room_number}` : 'Add a hotel room'}</h2></div><button disabled={busy} onClick={() => setEditing(null)}>Close editor</button></div><form key={editorKey} onSubmit={saveRoom} className="portal-form"><fieldset disabled={busy} className="room-editor-fields"><div className="portal-form-grid"><label>Room number<input name="room_number" required maxLength={20} defaultValue={editing.room_number || ''} /></label><label>Room category<select name="room_type_id" required defaultValue={editing.room_type_id || ''}><option value="">Select a room category</option>{editing.id && !types.some(t => t.id === editing.room_type_id) && <option value={editing.room_type_id}>{editing.room_type}</option>}{types.filter(t => !editing.id || t.facility_id === editing.facility_id).map(t => <option key={t.id} value={t.id}>{t.name} · {money(t.nightly_rate)}</option>)}</select></label><label>Floor<input name="floor" maxLength={30} defaultValue={editing.floor || ''} /></label><label>Operational status<select name="status" defaultValue={editing.status || 'available'}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><label>Room notes<textarea name="notes" rows="4" defaultValue={editing.notes || ''} /></label>{editing.image && <div className="hotel-current-photo"><img src={editing.image} alt={`Current photo of room ${editing.room_number}`} /><small>Current room photo · choose a new photo to replace it</small></div>}<RoomPhotoPicker files={files} onChange={setFiles} disabled={busy} multiple={false} /><button disabled={busy}>{busy ? 'Saving…' : editing.id ? 'Save room changes' : 'Create hotel room'}</button></fieldset></form></section>}
    <div className="workspace-filter-bar"><label><span><Search size={13} /> Search hotel rooms</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Room number, category, facility or floor" /></label><label>Operational status<select value={filter} onChange={e => setFilter(e.target.value)}><option value="">All statuses</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    {!data && !error && <p role="status">Loading your room collection…</p>}
    <div className="unit-management-grid hotel-room-grid">{visible?.map(room => <article className="unit-management-card" key={room.id}><div className="unit-management-image">{room.image || room.category_image ? <img src={room.image || room.category_image} alt={room.image ? `Room ${room.room_number}` : `${room.room_type} category photograph`} loading="lazy" /> : <div><Image size={35} /><span>Add a room photo</span></div>}<span className={`booking-status status-${room.status === 'available' ? 'confirmed' : room.status === 'inactive' ? 'cancelled' : 'new'}`}>{room.status}</span>{!room.image && room.category_image && <span className="room-category-photo-label">Category photo</span>}</div><div className="unit-management-copy"><small>{room.facility_name || `Facility ${room.facility_id}`} · {room.floor ? `FLOOR ${room.floor}` : 'HOTEL STAY'}</small><h2>Room {room.room_number}</h2><p><BedDouble size={15} /> {room.room_type} <Users size={15} /> Up to {room.max_guests || '—'} guests</p><div className="hotel-room-rates"><span>Single <strong>{money(room.nightly_rate)}</strong></span><span>Double <strong>{money(room.double_occupancy_rate)}</strong></span></div><div className="room-card-controls">{room.can_manage ? <label>Room status<select aria-label={`Operational status for room ${room.room_number}`} value={room.status} disabled={busy} onChange={e => setConfirmation({ room, status: e.target.value })}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label> : <small>View only</small>}{user.is_superuser && <div className="room-card-edit-actions"><button disabled={busy} onClick={() => edit(room)}><Pencil size={15} /> Edit</button><button disabled={busy} aria-label={`Remove room ${room.room_number}`} onClick={() => setConfirmation({ room, remove: true })}><Trash2 size={15} /></button></div>}</div></div></article>)}</div>
    {visible?.length === 0 && <div className="workspace-empty"><BedDouble size={35} /><h2>No rooms to show.</h2><p>Adjust your filters or add a hotel room to start your collection.</p></div>}
    {confirmation && <div className="workspace-panel room-confirmation" role="alertdialog" aria-modal="false" aria-labelledby="room-confirm"><h2 id="room-confirm">{confirmation.remove ? 'Remove' : 'Update'} room {confirmation.room.room_number}?</h2><p>{confirmation.remove ? 'Rooms with booking history must be marked inactive instead of deleted.' : `Set operational status to ${confirmation.status}.`}</p><div className="portal-toolbar"><button disabled={busy} onClick={update}>Confirm {confirmation.remove ? 'removal' : 'status change'}</button><button disabled={busy} onClick={() => setConfirmation(null)}>Keep current room</button></div></div>}
    {data?.count > 50 && <nav className="gallery-pagination" aria-label="Room pages"><button disabled={page === 1 || busy} onClick={() => setPage(n => n - 1)}>Previous</button><span>Page {page} · search and filters apply to these 50 rooms</span><button disabled={page * 50 >= data.count || busy} onClick={() => setPage(n => n + 1)}>Next</button></nav>}
  </main>;
}
