import { useEffect, useId, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BedDouble, Building2, CalendarDays, Pencil, Plus, Search } from 'lucide-react';
import WorkspaceHeader from '../components/WorkspaceHeader';
import { staffApi, staffRequest } from '../services/staffApi';
import '../styles/staff-facilities.css';
const base = '/api/staff/admin/facilities/';
const types = [
  ['hotel', 'Hotel rooms', 'Hotel room categories and inventory.', BedDouble],
  ['airbnb', 'Airbnb', 'Private-stay properties and rooms.', Building2],
  ['mixed', 'Both', 'Hotel rooms and Airbnb at this facility.', Building2],
  ['conference', 'Conference only', 'A venue without accommodation.', CalendarDays],
];
const blank = { name: '', code: '', facility_type: 'hotel', has_conference: false, address: '', phone: '', is_active: true };
const slug = name => name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

export function FacilityEditor({ facility, busy, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...blank, ...facility }));
  const [customCode, setCustomCode] = useState(Boolean(facility?.id));
  const heading = useId();
  function update(key, value) { setForm(old => ({ ...old, [key]: value })); }
  function submit(event) {
    event.preventDefault();
    onSave({ name: form.name.trim(), code: form.code.trim(), facility_type: form.facility_type, has_conference: form.facility_type === 'conference' || form.has_conference, address: form.address.trim(), phone: form.phone.trim(), is_active: form.is_active });
  }
  return <form method="post" className="workspace-panel portal-form facility-editor" aria-labelledby={heading} onSubmit={submit}><div className="workspace-panel-heading"><h2 id={heading}>{facility?.id ? `Edit ${facility.name}` : 'Add a facility'}</h2><button type="button" disabled={busy} onClick={onCancel}>Close</button></div><fieldset disabled={busy}><legend>Facility details</legend><div className="portal-form-grid"><label>Facility name<input name="name" value={form.name} maxLength={150} required onChange={e => { const name = e.target.value; setForm(old => ({ ...old, name, ...(!customCode ? { code: slug(name) } : {}) })); }} /></label><label>Unique code<input name="code" value={form.code} maxLength={50} pattern="[a-zA-Z0-9_-]+" required onChange={e => { setCustomCode(true); update('code', e.target.value); }} /><small>Use letters, numbers, hyphens or underscores. Each facility needs a different code.</small></label></div><label>Address<textarea name="address" autoComplete="street-address" rows={3} maxLength={5000} value={form.address} onChange={e => update('address', e.target.value)} /></label><label>Contact phone<input name="phone" type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={e => update('phone', e.target.value)} /></label></fieldset>
    <fieldset disabled={busy}><legend>Accommodation offered</legend><div className="facility-type-options">{types.map(([value, title, copy, Icon]) => <label key={value} className={form.facility_type === value ? 'is-selected' : ''}><input type="radio" name="facility_type" value={value} checked={form.facility_type === value} onChange={() => setForm(old => ({ ...old, facility_type: value, ...(value === 'conference' ? { has_conference: true } : {}) }))} /><Icon size={21} aria-hidden="true" /><span><strong>{title}</strong><small>{copy}</small></span></label>)}</div></fieldset>
    <fieldset disabled={busy}><legend>Availability and conferences</legend><label className="facility-check"><input name="has_conference" type="checkbox" checked={form.has_conference} disabled={form.facility_type === 'conference'} onChange={e => update('has_conference', e.target.checked)} /><span><strong>This facility offers conferences</strong><small>Conference facilities can belong to a hotel, Airbnb, or both. Add rates and inclusions in Conference packages after saving.</small></span></label><label className="facility-check"><input name="is_active" type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} /><span><strong>Facility is active</strong><small>Inactive facilities are hidden from new booking options. Existing bookings and records are retained.</small></span></label></fieldset>
    <div className="facility-editor-actions"><button type="submit" disabled={busy}>{busy ? 'Saving facility…' : facility?.id ? 'Save facility changes' : 'Create facility'}</button><button type="button" disabled={busy} onClick={onCancel}>Cancel</button></div></form>;
}

export default function StaffFacilities() {
  const { user } = useOutletContext();
  const [rows, setRows] = useState(null), [edit, setEdit] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [revision, setRevision] = useState(0);
  const editor = useRef(null), alert = useRef(null);
  useEffect(() => {
    if (!user.is_superuser) return;
    let active = true;
    staffRequest(base).then(data => { if (active) { setRows(data.results || data); setError(''); } }).catch(err => { if (active) setError(err.status === 404 ? 'Facility management is unavailable. Update the backend before managing facilities.' : err.message); });
    return () => { active = false; };
  }, [revision, user.is_superuser]);
  useEffect(() => { if (edit) { editor.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); editor.current?.querySelector('input')?.focus(); } }, [edit]);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  if (!user.is_superuser) return <section><h1>Administrator access required</h1><Link to="/staff/dashboard">Return to workspace</Link></section>;
  async function save(payload) {
    setBusy(true); setError(''); setNotice('');
    try {
      await staffApi.csrf();
      const saved = await staffRequest(`${base}${edit.id ? `${edit.id}/` : ''}`, { method: edit.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      setRows(old => [...(old || []).filter(row => row.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name)));
      setEdit(null); setNotice(`${saved.name} ${edit.id ? 'updated' : 'created'}.`);
    } catch (err) { setError(err.status === 404 ? 'Facility management is unavailable. No changes were saved. Update the backend and try again.' : err.message); }
    finally { setBusy(false); }
  }
  const filtered = rows?.filter(row => `${row.name} ${row.code} ${row.address}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="staff-facilities"><WorkspaceHeader eyebrow="PROPERTY MANAGEMENT" title="Facilities" description="Manage your locations, choose hotel rooms or Airbnb, and configure which facilities offer conferences." actions={<button type="button" className="portal-button" disabled={busy || !rows} onClick={() => { setError(''); setNotice(''); setEdit({ ...blank }); }}><Plus size={17} /> Add facility</button>} />
    {error && <div className="portal-alert" role="alert" ref={alert} tabIndex={-1}><p>{error}</p>{!edit && <button type="button" onClick={() => setRevision(n => n + 1)}>Try again</button>}</div>}{notice && <p role="status" className="portal-notice">{notice}</p>}
    {edit && <div ref={editor} className="facility-editor-anchor"><FacilityEditor key={edit.id || 'new'} facility={edit} busy={busy} onSave={save} onCancel={() => setEdit(null)} /></div>}
    <div className="facility-toolbar"><label><Search size={17} aria-hidden="true" /> Find a facility<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, code or address" /></label><span>{rows?.length || 0} facilities · {rows?.filter(row => row.has_conference).length || 0} with conferences</span></div>
    {!rows && !error && <p role="status">Loading facilities…</p>}<div className="facility-card-grid">{filtered?.map(row => <article key={row.id} className="workspace-panel facility-card"><header><span className={`booking-status status-${row.is_active ? 'confirmed' : 'cancelled'}`}>{row.is_active ? 'Active' : 'Inactive'}</span><button type="button" disabled={busy} onClick={() => { setNotice(''); setError(''); setEdit(row); }} aria-label={`Edit ${row.name}`}><Pencil size={16} /> Edit</button></header><h2>{row.name}</h2><span className="facility-code">{row.code}</span><p>{types.find(([type]) => type === row.facility_type)?.[1] || row.facility_type}</p>{row.has_conference && <p className="facility-conference"><CalendarDays size={16} /> Conference facilities</p>}{row.address && <p className="facility-address">{row.address}</p>}{row.phone && <a href={`tel:${row.phone}`}>{row.phone}</a>}<nav aria-label={`Manage ${row.name}`}>{['hotel', 'mixed'].includes(row.facility_type) && <Link to="/staff/room-categories">Manage hotel rooms</Link>}{['airbnb', 'mixed'].includes(row.facility_type) && <Link to="/staff/airbnb/rooms">Manage Airbnb rooms</Link>}{row.has_conference && <Link to={`/staff/packages?facility=${row.id}`}>Configure conference packages</Link>}</nav></article>)}</div>{rows && !filtered.length && <div className="workspace-empty"><Building2 size={30} /><h2>{rows.length ? 'No matching facilities' : 'Add your first facility'}</h2><p>{rows.length ? 'Try a different name, code or address.' : 'Create a location, choose its accommodation type and configure conferences.'}</p></div>}
  </section>;
}
