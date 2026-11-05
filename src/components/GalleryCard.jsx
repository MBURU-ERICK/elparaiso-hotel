export default function GalleryCard({ image, priority = false }) {
  return <article className="gallery-item">
    <img src={image.image_url} srcSet={`${image.thumbnail_url} 640w, ${image.image_url} 1920w`}
      sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
      alt={image.alt_text} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
    <div className="gallery-item-overlay"><span>{image.category}</span><h3>{image.title}</h3>
      {image.description && <p>{image.description}</p>}</div>
  </article>;
}
