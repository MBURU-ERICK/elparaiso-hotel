import { useEffect, useState } from 'react';
import { Plus, BedDouble, Users, Pencil, Image, Building2, Trash2 } from 'lucide-react';
import { customerRequest } from '../customer/customerApi';
import RoomPhotoPicker from './RoomPhotoPicker';
import { validateRoomPhotos } from '../utils/roomPhotos';
import { airbnbPhotos } from '../services/airbnbPhotos';
const base = '/api/customers/staff/units/';
export default function StaffUnitManager() {
  const [files, setFiles] = useState([]), [editorKey, setEditorKey] = useState(0), [uploading, setUploading] = useState('');
  const [data, setData] = useState(null), [edit, setEdit] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [search, setSearch] = useState(''), [propertyFilter, setPropertyFilter] = useState(''), [addingProperty, setAddingProperty] = useState(false), [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([customerRequest(base), customerRequest('/api/customers/staff/properties/'), customerRequest('/api/customers/facilities/')]).then(([u, p, f]) => { if (active) setData({ units: u.results || u, properties: p.results || p, facilities: f.results || f }); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [revision]);
  async function save(event) {
    event.preventDefault(); setError(''); setBusy(true); const fields = Object.fromEntries(new FormData(event.currentTarget));
    fields.images = fields.images.split('\n').map(url => url.trim()).filter(Boolean);
    fields.amenities = fields.amenities.split(',').map(a => a.trim()).filter(Boolean);
    fields.is_published = fields.is_published === 'on';
    const validation = validateRoomPhotos(files, 12 - fields.images.length - (edit.photos?.length || 0));
    if (validation) { setError(validation); setBusy(false); return; }
    let saved;
    let completed = 0;
    try {
      saved = await customerRequest(`${base}${edit.id ? `${edit.id}/` : ''}`, { method: edit.id ? 'PATCH' : 'POST', body: JSON.stringify(fields) });
      setEdit(saved);
      for (const [index, file] of files.entries()) {
        setUploading(`Uploading photo ${index + 1} of ${files.length}…`);
        const photo = await airbnbPhotos.upload(saved.id, file, `${saved.name} at ${saved.property_name}`);
        completed += 1;
        saved = { ...saved, photos: [...(saved.photos || []), photo] };
        setEdit(saved); setFiles(files.slice(completed));
      }
      setEdit(null); setFiles([]);
      setNotice('Room and photos saved. Available rooms appear on the website when both room and facility are published.');
      setRevision(n => n + 1);
    } catch (e) {
      setError(saved ? `Room details saved. ${completed} photo(s) uploaded. ${e.message} The remaining photos are selected; save again to retry.` : e.message);
      if (saved) setRevision(n => n + 1);
    } finally { setBusy(false); setUploading(''); }
  }
  function openEditor(unit) { setEdit(unit); setFiles([]); setEditorKey(n => n + 1); setNotice(''); setError(''); }
  async function removePhoto(photo) {
    if (!window.confirm(`Remove this photo from ${edit.name}?`)) return;
    setBusy(true); setError('');
    try { await airbnbPhotos.remove(edit.id, photo.id); setEdit(old => ({ ...old, photos: old.photos.filter(p => p.id !== photo.id) })); setRevision(n => n + 1); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function propertyAction(property) {
    setBusy(true); setError('');
    try { await customerRequest(`/api/customers/staff/properties/${property.id}/`, { method: 'PATCH', body: JSON.stringify({ is_published: !property.is_published }) }); setRevision(n => n + 1); setNotice('Facility publication updated.'); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function addProperty(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await customerRequest('/api/customers/staff/properties/', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); setAddingProperty(false); setRevision(n => n + 1); setNotice('Airbnb property created. Add its rooms and publish when ready.'); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const visible = data?.units.filter(u => (!propertyFilter || String(u.property) === propertyFilter) && `${u.name} ${u.unit_number} ${u.property_name}`.toLowerCase().includes(search.toLowerCase()));
  const availableFacilities = data?.facilities.filter(f => ['airbnb', 'mixed'].includes(f.facility_type) && !data.properties.some(p => p.facility === f.id));
  return <section>{error && <p role="alert" className="portal-alert">{error}<button onClick={() => setRevision(n => n + 1)}>Retry</button></p>}{notice && <p role="status" className="portal-notice">{notice}</p>}{!data && !error && <p role="status">Loading your room collection…</p>}
    <div className="workspace-panel unit-toolbar"><div><Building2 size={22} /><strong>{data?.units.length || 0} rooms in your collection</strong></div><div className="portal-toolbar"><button disabled={busy || !data?.properties.length} onClick={() => openEditor({})}> <Plus size={16} /> Add Airbnb room</button><button disabled={busy} onClick={() => setAddingProperty(v => !v)}>Set up a facility</button></div></div>
    {addingProperty && <form className="portal-form workspace-panel" onSubmit={addProperty}><h2>Set up an Airbnb property</h2><label>Existing facility<select name="facility" required><option value="">Choose an Airbnb / mixed facility</option>{availableFacilities?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label>Property description<textarea name="description" maxLength={5000} /></label><button disabled={busy || !availableFacilities?.length}>Create property</button><small>Facilities and staff access are managed by an administrator in Django administration.</small></form>}
    {data?.properties.length > 0 && <div className="workspace-property-list">{data.properties.map(p => <article key={p.id}><Building2 size={20} /><div><strong>{p.name}</strong><small>{p.is_published ? 'Facility is live' : 'Facility is unpublished'}</small></div><button disabled={busy} onClick={() => propertyAction(p)}>{p.is_published ? 'Unpublish' : 'Publish'}</button></article>)}</div>}
    {edit && <section className="workspace-panel unit-editor"><div className="workspace-panel-heading"><div><span className="eyebrow">CURATE YOUR NEXT WELCOME</span><h2>{edit.id ? `Edit ${edit.name}` : 'Add an Airbnb room'}</h2></div><button type="button" disabled={busy} onClick={() => setEdit(null)}>Close editor</button></div><form className="portal-form" onSubmit={save} key={editorKey}><fieldset disabled={busy} className="room-editor-fields"><div className="portal-form-grid"><label>Airbnb facility<select name="property" disabled={Boolean(edit.id)} required defaultValue={edit.property || ''}><option value="">Select facility</option>{data.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Room / unit number<input name="unit_number" defaultValue={edit.unit_number || ''} maxLength={30} required /></label><label>Room name<input name="name" defaultValue={edit.name || ''} maxLength={150} required /></label><label>Nightly price (KES)<input name="nightly_rate" type="number" min="0.01" step="0.01" defaultValue={edit.nightly_rate || ''} required /></label><label>Maximum guests<input name="max_guests" type="number" min="1" max="10000" defaultValue={edit.max_guests || 1} required /></label><label>Bedrooms<input name="bedrooms" type="number" min="0" defaultValue={edit.bedrooms ?? 1} required /></label><label>Bathrooms<input name="bathrooms" type="number" min="0" defaultValue={edit.bathrooms ?? 1} required /></label><label>Room status<select name="status" defaultValue={edit.status || 'available'}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label></div><label>Description<textarea name="description" defaultValue={edit.description || ''} maxLength={5000} rows="4" /></label><label>Amenities, separated by commas<input name="amenities" defaultValue={edit.amenities?.join(', ') || ''} placeholder="Wi-Fi, Kitchen, Parking" maxLength={2000} /></label><fieldset className="room-photo-section"><legend>Room photos</legend><RoomPhotoPicker files={files} onChange={setFiles} disabled={busy} existingCount={(edit.images?.length || 0) + (edit.photos?.length || 0)} />{uploading && <p role="status">{uploading}</p>}{edit.photos?.length > 0 && <><h3>Saved room photos</h3><div className="room-photo-preview-grid">{edit.photos.map(photo => <article className="room-photo-preview" key={photo.id}><img src={photo.thumbnail_url} alt={photo.alt_text} /><button type="button" disabled={busy} onClick={() => removePhoto(photo)} aria-label={`Remove ${photo.alt_text}`}><Trash2 size={15} /></button></article>)}</div></>}<details className="room-photo-links"><summary>Existing photo links (optional)</summary><label>Photo URLs — one per line<textarea name="images" rows="3" defaultValue={edit.images?.join('\n') || ''} placeholder="https://…" /></label></details><small>The homepage rotates room photos every five seconds. Draft room photos remain private.</small></fieldset><label className="booking-checkbox"><input name="is_published" type="checkbox" defaultChecked={edit.is_published} /> Publish this room on the website</label><button disabled={busy}>{busy ? uploading || 'Saving…' : edit.id ? 'Save room changes' : 'Create Airbnb room'}</button></fieldset></form></section>}
    <div className="workspace-filter-bar"><label>Search rooms<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Room name, unit or facility" type="search" /></label><label>Facility<select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)}><option value="">All facilities</option>{data?.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
    <div className="unit-management-grid">{visible?.map(unit => <article key={unit.id} className="unit-management-card"><div className="unit-management-image">{unit.images?.length || unit.photos?.length ? <img src={unit.photos?.[0]?.thumbnail_url || unit.images[0]} alt={unit.name} loading="lazy" /> : <div><Image size={35} /><span>Add room photos</span></div>}<span className={`booking-status status-${unit.is_published && data.properties.find(p => p.id === unit.property)?.is_published && unit.status === 'available' ? 'confirmed' : 'new'}`}>{unit.is_published && data.properties.find(p => p.id === unit.property)?.is_published && unit.status === 'available' ? 'Live on website' : 'Not live'}</span></div><div className="unit-management-copy"><small>{unit.property_name} · UNIT {unit.unit_number}</small><h2>{unit.name}</h2><p><Users size={15} /> {unit.max_guests} guests <BedDouble size={15} /> {unit.bedrooms} bedrooms</p><div><strong>KES {Number(unit.nightly_rate).toLocaleString()} <small>/ night</small></strong><button disabled={busy} onClick={() => openEditor(unit)}><Pencil size={15} /> Edit room</button></div></div></article>)}</div>{visible?.length === 0 && <div className="workspace-empty"><BedDouble size={35} /><h2>Make room for a new stay.</h2><p>Add your first room, or adjust your search to find an existing one.</p></div>}
  </section>;
}
