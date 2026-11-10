import { useState } from 'react';
import { galleryApi, galleryCategories } from '../services/galleryApi';
export default function GalleryUploadForm({ facilities, image, onSaved, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get('image');
    if (!file?.size) data.delete('image');
    if (file?.size > 8 * 1024 * 1024) { setError('Choose an image smaller than 8 MiB.'); return; }
    data.set('featured', String(data.get('featured') === 'on'));
    data.set('published', String(data.get('published') === 'on'));
    setBusy(true); setError('');
    try { if (image) await galleryApi.update(image.id, data); else await galleryApi.upload(data); onSaved(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <form className="gallery-upload portal-form workspace-panel" onSubmit={submit}>
    <h2>{image ? 'Edit photograph' : 'Upload a photograph'}</h2>
    <p>JPEG, PNG or WebP, up to 8 MiB. At least 200px per side and at most 24 megapixels. New uploads stay private until published.</p>
    {error && <p role="alert">{error}</p>}
    <label>Photograph<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!image} /></label>
    <label>Title<input name="title" maxLength={160} defaultValue={image?.title} required /></label>
    <label>Image description for accessibility<input name="alt_text" maxLength={300} defaultValue={image?.alt_text} required /></label>
    <label>Caption<textarea name="description" maxLength={2000} defaultValue={image?.description} /></label>
    <label>Category<select name="category" defaultValue={image?.category || 'general'}>{galleryCategories.map(category => <option key={category}>{category}</option>)}</select></label>
    <label>Facility<select name="facility" defaultValue={image?.facility || facilities[0]?.id} required>{facilities.filter(f => !image || f.id === image.facility).map(f => <option value={f.id} key={f.id}>{f.name}</option>)}</select></label>
    <label>Display order<input name="display_order" type="number" min="0" max="2147483647" defaultValue={image?.display_order || 0} required /></label>
    <label className="checkbox-label"><input name="featured" type="checkbox" defaultChecked={image?.featured} /> Feature on homepage</label>
    <label className="checkbox-label"><input name="published" type="checkbox" defaultChecked={image?.published} /> Publish for all visitors</label>
    <div className="gallery-actions"><button disabled={busy || !facilities.length}>{busy ? 'Saving…' : 'Save photograph'}</button>{onCancel && <button type="button" disabled={busy} onClick={onCancel}>Cancel</button>}</div>
  </form>;
}
