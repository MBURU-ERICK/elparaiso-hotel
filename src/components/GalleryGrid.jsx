import GalleryCard from './GalleryCard';
export default function GalleryGrid({ images = [], loading, error, retry }) {
  if (loading) return <p role="status" className="gallery-state">Loading photographs…</p>;
  if (error) return <div role="alert" className="gallery-state"><p>{error}</p><button onClick={retry}>Try again</button></div>;
  if (!images.length) return <p role="status" className="gallery-state">Photographs are being prepared. Please check back soon.</p>;
  return <div className="gallery-grid">{images.map(image => <GalleryCard key={image.id} image={image} />)}</div>;
}
