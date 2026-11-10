import WorkspaceHeader from './WorkspaceHeader';
import { useCallback, useEffect, useState } from 'react';
import { galleryApi } from '../services/galleryApi';
import { staffApi } from '../services/staffApi';
import GalleryCard from './GalleryCard';
import GalleryUploadForm from './GalleryUploadForm';
export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const load = useCallback(async () => {
    try {
      const [data, profile] = await Promise.all([galleryApi.staffList(page), staffApi.me()]);
      setError(''); setImages(data.results); setCount(data.count);
      setFacilities(profile.user.facilities.filter(f => f.actions.includes('manage')));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [page]);
  useEffect(() => {
    let active = true;
    Promise.all([galleryApi.staffList(page), staffApi.me()]).then(([data, profile]) => {
      if (!active) return;
      setImages(data.results); setCount(data.count);
      setFacilities(profile.user.facilities.filter(f => f.actions.includes('manage')));
      setError('');
    }).catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);
  async function mutate(fn, message) {
    setBusy(true); setError(''); setMessage('');
    try { await fn(); setMessage(message); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="gallery-manager"><WorkspaceHeader eyebrow="YOUR PROPERTY PHOTO COLLECTION" title="Photo library" description="Curate the photographs behind every welcome. Airbnb room photos follow their room’s publication settings." actions={<span className="booking-status status-confirmed">{count} photographs</span>} />
    {error && <div role="alert"><p>{error}</p><button onClick={() => { setLoading(true); load(); }}>Try again</button></div>}
    {message && <p role="status">{message}</p>}
    {!loading && !facilities.length && <p>You need a facility manager assignment to manage photographs.</p>}
    {!!facilities.length && <GalleryUploadForm key={editing?.id || 'new'} image={editing} facilities={facilities} onCancel={editing ? () => setEditing(null) : undefined} onSaved={() => { setEditing(null); setMessage('Photograph saved.'); load(); }} />}
    {loading ? <p role="status">Loading photographs…</p> : !images.length ? <p>No photographs yet.</p> : <div className="gallery-grid">{images.map(image => <div className="unit-management-card gallery-management-card" key={image.id}>
      <GalleryCard image={image} /><p>{image.published ? 'Published' : 'Private draft'} · Order {image.display_order}</p>
      <div className="gallery-actions"><button disabled={busy} onClick={() => setEditing(image)}>Edit</button>
        <button disabled={busy} onClick={() => mutate(() => galleryApi.update(image.id, { published: !image.published }), 'Publication updated.')}>{image.published ? 'Unpublish' : 'Publish'}</button>
        <button disabled={busy} onClick={() => setDeleting(image)}>Delete</button></div></div>)}</div>}
    {deleting && <div role="alertdialog" aria-modal="false" aria-labelledby="delete-title" className="gallery-confirm"><h2 id="delete-title">Delete “{deleting.title}”?</h2><p>This removes the photograph from the gallery.</p><button disabled={busy} onClick={() => mutate(async () => { await galleryApi.remove(deleting.id); setDeleting(null); }, 'Photograph deleted.')}>Confirm delete</button><button disabled={busy} onClick={() => setDeleting(null)}>Keep photograph</button></div>}
    {count > 24 && <nav className="gallery-pagination" aria-label="Staff gallery pages"><button disabled={page === 1 || loading} onClick={() => { setLoading(true); setPage(p => p - 1); }}>Previous</button><span>Page {page}</span><button disabled={page * 24 >= count || loading} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Next</button></nav>}
  </section>;
}
