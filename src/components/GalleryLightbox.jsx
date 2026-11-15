import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Pause, Play, X, ZoomIn, ZoomOut } from 'lucide-react';
import '../styles/gallery-journal.css';

export default function GalleryLightbox({ images, initialIndex = 0, onClose }) {
  const dialog = useRef(null);
  const titleId = useId();
  const touch = useRef(null);
  const stage = useRef(null);
  const thumbnails = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const image = images[index];
  function select(next) { setIndex((next + images.length) % images.length); setPlaying(false); setZoomed(false); }
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element.showModal();
    return () => { element.close(); if (opener?.isConnected) opener.focus(); };
  }, []);
  useEffect(() => {
    stage.current?.scrollTo({ top: 0, left: 0 });
  }, [index, zoomed]);
  useEffect(() => {
    const rail = thumbnails.current;
    const thumb = rail?.children[index];
    if (thumb) rail.scrollTo({ left: thumb.offsetLeft - rail.offsetLeft - (rail.clientWidth - thumb.clientWidth) / 2 });
  }, [index]);
  useEffect(() => {
    if (!playing || zoomed || images.length < 2) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex(old => (old + 1) % images.length); }, 5000);
    return () => window.clearInterval(timer);
  }, [playing, zoomed, images.length]);
  return <dialog ref={dialog} className="gallery-lightbox" aria-labelledby={titleId} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !zoomed) {
      e.preventDefault(); select(e.key === 'Home' ? 0 : e.key === 'End' ? images.length - 1 : index + (e.key === 'ArrowLeft' ? -1 : 1));
    }
  }}>
    <div className="gallery-viewer-shell">
      <header className="gallery-viewer-toolbar"><span className="gallery-viewer-brand">ELPARAISO <span>/ THE PHOTO JOURNAL</span></span><div>
        {images.length > 1 && <button type="button" aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} aria-pressed={playing} onClick={() => { setZoomed(false); setPlaying(old => !old); }}>{playing ? <Pause size={20} /> : <Play size={20} />}</button>}
        <button type="button" aria-label={zoomed ? 'Fit photograph to screen' : 'Zoom photograph'} aria-pressed={zoomed} onClick={() => { setZoomed(old => !old); setPlaying(false); }}>{zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}</button>
        <a href={image.image_url} target="_blank" rel="noopener noreferrer" aria-label="Open original photograph in a new tab"><ExternalLink size={19} /></a>
        <button type="button" className="gallery-viewer-close" aria-label="Close photograph viewer" onClick={onClose} autoFocus><X size={24} /></button>
      </div></header>
      <div className="gallery-viewer-main">
        {images.length > 1 && <button className="gallery-viewer-prev" type="button" aria-label="Previous photograph" onClick={() => select(index - 1)}><ArrowLeft size={23} /></button>}
        <div ref={stage} tabIndex={zoomed ? 0 : undefined} aria-label={zoomed ? 'Zoomed photograph; scroll to explore' : undefined} className={`gallery-viewer-stage${zoomed ? ' is-zoomed' : ''}`} onTouchStart={e => { if (!zoomed) touch.current = [e.touches[0].clientX, e.touches[0].clientY]; }} onTouchEnd={e => {
          if (!touch.current || zoomed) return;
          const [x, y] = touch.current; touch.current = null;
          const dx = e.changedTouches[0].clientX - x, dy = e.changedTouches[0].clientY - y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) select(index + (dx < 0 ? 1 : -1));
        }}>
          <ViewerImage key={image.id} image={image} />
        </div>
        {images.length > 1 && <button className="gallery-viewer-next" type="button" aria-label="Next photograph" onClick={() => select(index + 1)}><ArrowRight size={23} /></button>}
      </div>
      <div className="gallery-viewer-caption"><div><span>{image.category}</span><h2 id={titleId}>{image.title}</h2>{image.description && <p>{image.description}</p>}</div><span role="status" aria-live={playing ? 'off' : 'polite'}>{index + 1} / {images.length}</span></div>
      {images.length > 1 && <nav ref={thumbnails} className="gallery-viewer-thumbnails" aria-label="Choose a photograph">{images.map((photo, n) => <button key={photo.id} type="button" aria-label={`View ${photo.title}`} aria-current={index === n ? 'true' : undefined} onClick={() => select(n)}><img src={photo.thumbnail_url || photo.image_url} alt="" loading="lazy" /></button>)}</nav>}
    </div>
  </dialog>;
}
function ViewerImage({ image }) {
  const [failed, setFailed] = useState(false);
  return failed ? <p role="status">This photograph could not be loaded. Try another photo or open the original.</p> : <img src={image.image_url} alt={image.alt_text || image.title} onError={() => setFailed(true)} decoding="async" />;
}
