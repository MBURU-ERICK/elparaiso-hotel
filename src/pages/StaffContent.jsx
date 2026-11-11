import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { staffApi, staffRequest } from '../services/staffApi';

const definitions = {
  events: { title: 'Events & advertisements', fields: [['title', 'Event title'], ['event_type', 'Event type', 'type'], ['description', 'Description', 'textarea'], ['image', 'Event image', 'file'], ['start_date', 'Start date (optional)', 'date'], ['end_date', 'End date (optional)', 'date'], ['advertise', 'Publish as an advertisement', 'checkbox']] },
  'event-types': { title: 'Event types', fields: [['name', 'Type name'], ['description', 'Description', 'textarea']] },
  contacts: { title: 'Contact directory', fields: [['name', 'Contact owner'], ['title', 'Title in the organisation'], ['department', 'Department'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['display_order', 'Hierarchy order (senior contacts first)', 'number'], ['published', 'Display on contact page', 'checkbox']] },
};
export default function StaffContent({ kind = 'events' }) {
  const { user } = useOutletContext();
  const [rows, setRows] = useState([]), [types, setTypes] = useState([]), [selected, setSelected] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [revision, setRevision] = useState(0);
  const config = definitions[kind];
  useEffect(() => {
    let active = true;
    Promise.all([staffRequest(`/api/staff/admin/${kind}/`), staffRequest('/api/staff/admin/event-types/')]).then(([data, categories]) => { if (active) { setRows(data.results || data); setTypes(categories.results || categories); } }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind, revision]);
  if (!user.is_superuser) return <p role="alert">Administrator access required.</p>;
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const data = new FormData(event.currentTarget);
    config.fields.forEach(([key, , type]) => { if (type === 'checkbox') data.set(key, data.has(key) ? 'true' : 'false'); if ((type === 'file' && !data.get(key)?.size) || (type === 'date' && !data.get(key))) data.delete(key); });
    // Empty dates clear existing optional dates on edits.
    config.fields.filter(([, , type]) => type === 'date').forEach(([key]) => { if (!data.has(key)) data.set(key, ''); });
    try { await staffApi.csrf(); await staffRequest(`/api/staff/admin/${kind}/${selected ? `${selected.id}/` : ''}`, { method: selected ? 'PATCH' : 'POST', body: data }); setSelected(null); event.target.reset(); setRevision(n => n + 1); setNotice('Saved successfully.'); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(row) {
    if (!window.confirm(`Delete ${row.title || row.name}?`)) return;
    setBusy(true); setError('');
    try { await staffApi.csrf(); await staffRequest(`/api/staff/admin/${kind}/${row.id}/`, { method: 'DELETE' }); setSelected(null); setRevision(n => n + 1); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section><h1>{config.title}</h1>{kind === 'events' && <p>Events are private unless advertising is enabled. Images and dates are optional.</p>}{kind === 'contacts' && <p>Published contacts appear on the guest contact page, ordered by their place in the organisation.</p>}{error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}<div className="booking-detail-columns"><form key={`${kind}:${selected?.id || 'new'}`} className="portal-form workspace-panel" onSubmit={save}><h2>{selected ? 'Edit' : 'Add new'}</h2>{config.fields.map(([key, label, type = 'text']) => <label key={key}>{label}{type === 'textarea' ? <textarea name={key} defaultValue={selected?.[key] || ''} maxLength={kind === 'events' ? 5000 : 3000} required={kind === 'events'} /> : type === 'type' ? <select name={key} defaultValue={selected?.[key] || ''} required><option value="">Select event type</option>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select> : <input name={key} type={type} accept={type === 'file' ? 'image/jpeg,image/png,image/webp' : undefined} defaultValue={['file', 'checkbox'].includes(type) ? undefined : selected?.[key] ?? (type === 'number' ? 0 : '')} defaultChecked={type === 'checkbox' ? selected?.[key] ?? key === 'published' : undefined} required={['title', 'name'].includes(key) || (kind === 'contacts' && key === 'title')} min={type === 'number' ? 0 : undefined} />}</label>)}<button disabled={busy}>Save {kind === 'events' ? 'event' : 'details'}</button>{selected && <button type="button" onClick={() => setSelected(null)}>Cancel editing</button>}</form><div className="workspace-panel"><h2>Current entries</h2>{loading && <p role="status">Loading…</p>}{!loading && !rows.length && <p>No entries yet.</p>}{rows.map(row => <article className="correspondence-message" key={row.id}>{row.image && <img src={row.image} alt={row.title} style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} />}<h3>{row.title || row.name}</h3><p>{row.type_name || row.department} {row.start_date || ''}</p>{kind === 'events' && <p>{row.advertise ? 'Published advertisement' : 'Private event'}</p>}{kind === 'contacts' && <p>{row.title} · {row.email || row.phone} · {row.published ? 'Published' : 'Hidden'}</p>}<button disabled={busy} onClick={() => setSelected(row)}>Edit</button> <button disabled={busy} onClick={() => remove(row)}>Delete</button></article>)}</div></div></section>;
}
