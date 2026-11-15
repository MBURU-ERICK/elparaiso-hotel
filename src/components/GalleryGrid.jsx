import { useState } from 'react';
import GalleryCard from './GalleryCard';
import GalleryLightbox from './GalleryLightbox';
export default function GalleryGrid({ images = [], loading, error, retry }) {
  const [selected, setSelected] = useState(null);
  if (loading) return <div className="gallery-state journal-loading" role="status"><span>Loading photographs…</span><div aria-hidden="true">{[1, 2, 3, 4].map(n => <i key={n} />)}</div></div>;
  if (error) return <div role="alert" className="gallery-state"><p>{error}</p><button onClick={retry}>Try again</button></div>;
  if (!images.length) return <p role="status" className="gallery-state">Photographs are being prepared. Please check back soon.</p>;
  return <><div className="gallery-grid">{images.map(image => <GalleryCard key={image.id} image={image} onOpen={() => setSelected(image.id)} />)}</div>{selected !== null && images.some(image => image.id === selected) && <GalleryLightbox images={images} initialIndex={images.findIndex(image => image.id === selected)} onClose={() => setSelected(null)} />}</>;
}
