import { Expand } from 'lucide-react';
export default function GalleryCard({ image, priority = false, onOpen }) {
  const photo = <><img src={image.image_url} srcSet={`${image.thumbnail_url || image.image_url} 640w, ${image.image_url} 1920w`}
    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 66vw"
    alt={image.alt_text || image.title} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
    <div className="gallery-item-overlay"><span>{image.category}</span><h3>{image.title}</h3>{image.description && <p>{image.description}</p>}</div>
    {onOpen && <span className="journal-photo-expand" aria-hidden="true"><Expand size={18} /> View photo</span>}</>;
  return <article className="gallery-item">{onOpen ? <button type="button" className="journal-photo-button" aria-label={`View ${image.title} photograph`} aria-haspopup="dialog" onClick={onOpen}>{photo}</button> : photo}</article>;
}
