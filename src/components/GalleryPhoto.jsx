import { useGallery } from '../hooks/useGallery';
export default function GalleryPhoto({ category = '', className = '' }) {
  const { images, loading, error, retry } = useGallery({ category });
  const image = images[0];
  return <div className={`dynamic-photo ${className}`}>
    {image ? <img src={image.image_url} srcSet={`${image.thumbnail_url} 640w, ${image.image_url} 1920w`} sizes="(max-width: 760px) 100vw, 50vw" alt={image.alt_text} loading="lazy" />
      : <div className="photo-placeholder">{loading ? 'Loading photograph…' : error ? <button onClick={retry}>Retry photograph</button> : 'Elparaiso Hotel · Rumuruti'}</div>}
  </div>;
}
