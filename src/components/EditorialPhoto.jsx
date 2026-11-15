import { useState } from 'react';
import { Camera, Expand } from 'lucide-react';
import { useHomeResource } from '../hooks/useHomeResource';
import { galleryApi } from '../services/galleryApi';
import { photography } from '../data/photography';
import GalleryLightbox from './GalleryLightbox';
const categories = { general: 'Life at Elparaiso', rooms: 'Hotel accommodation', restaurant: 'Around the table', garden: 'The garden', airbnb: 'Private accommodation', experiences: 'Time together', conference: 'The conference hall', celebrations: 'Gatherings at Elparaiso' };
const loaders = Object.fromEntries(Object.keys(categories).map(category => [category, () => galleryApi.list({ category: ['conference', 'celebrations'].includes(category) ? 'general' : category })]));

export default function EditorialPhoto({ category = 'general', index = 0, hero = false, caption }) {
  const { data } = useHomeResource(`photos:${category}`, loaders[category] || loaders.general);
  const [open, setOpen] = useState(false);
  const [failedUrl, setFailedUrl] = useState('');
  const rows = Array.isArray(data) ? data : data?.results || [];
  const source = ['conference', 'celebrations'].includes(category) ? (photography[category] ? [photography[category]] : []) : rows.length ? rows : photography[category] ? [photography[category]] : [];
  const images = source.map((photo, i) => ({ ...photo, id: photo.id || `${category}-${i}`, title: photo.title || categories[category] || 'Elparaiso', category: photo.category || categories[category], description: photo.description || '' }));
  const selected = images.length ? index % images.length : 0;
  const photo = images[selected];
  return <div className="editorial-photo"><button type="button" className="editorial-photo-open" disabled={!photo || failedUrl === photo.image_url} aria-label={`View ${photo?.title || categories[category]} photographs`} aria-haspopup="dialog" onClick={() => setOpen(true)}>{photo && failedUrl !== photo.image_url ? <img src={photo.image_url} srcSet={photo.thumbnail_url && photo.thumbnail_url !== photo.image_url ? `${photo.thumbnail_url} 640w, ${photo.image_url} 1920w` : undefined} sizes={hero ? '(min-width: 900px) 55vw, 100vw' : '(min-width: 900px) 45vw, 100vw'} alt={photo.alt_text || photo.title} loading={hero ? 'eager' : 'lazy'} fetchPriority={hero ? 'high' : 'auto'} decoding="async" onError={() => setFailedUrl(photo.image_url)} /> : <span className="editorial-photo-empty"><Camera size={34} strokeWidth={1} aria-hidden="true" />Elparaiso · A little room for your next memory</span>}<span className="editorial-photo-caption"><span>{caption || categories[category]}</span>{photo && failedUrl !== photo.image_url && <span><Expand size={15} aria-hidden="true" /> View photos</span>}</span></button>{open && photo && <GalleryLightbox images={images} initialIndex={selected} onClose={() => setOpen(false)} />}</div>;
}
