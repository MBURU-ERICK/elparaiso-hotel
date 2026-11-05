import { useEffect, useRef, useState } from 'react';
import { useGallery } from '../hooks/useGallery';
export function GalleryCarouselView({ images = [], loading, error, retry }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const touch = useRef(null);
  const count = images.length;
  const active = count ? index % count : 0;
  const move = delta => setIndex(n => (n + delta + count) % count);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = event => setReducedMotion(event.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (count < 2 || hovered || focused || paused || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex(n => (n + 1) % count); }, 6500);
    return () => window.clearInterval(timer);
  }, [count, hovered, focused, paused, reducedMotion]);
  return <section className="gallery-carousel" aria-label="Featured photographs of Elparaiso" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (count && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}
    onTouchStart={event => { touch.current = [event.touches[0].clientX, event.touches[0].clientY]; }}
    onTouchEnd={event => { if (!touch.current || !count) return; const [x, y] = touch.current; const dx = event.changedTouches[0].clientX - x; const dy = event.changedTouches[0].clientY - y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1); touch.current = null; }}>
    {loading && <p role="status">Loading Elparaiso photographs…</p>}
    {error && <div className="carousel-message"><p>Our photographs are temporarily unavailable.</p><button onClick={retry}>Try again</button></div>}
    {!loading && !error && !count && <p className="carousel-message">Welcome to Elparaiso Hotel · Rumuruti</p>}
    {images.map((image, n) => <div key={image.id} hidden={n !== active} className="carousel-slide" role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${count}`}>
      <img src={image.image_url} srcSet={`${image.thumbnail_url} 640w, ${image.image_url} 1920w`} sizes="100vw"
        alt={image.alt_text} loading={n === 0 ? 'eager' : 'lazy'} fetchPriority={n === 0 ? 'high' : 'auto'} />
    </div>)}
    {count > 1 && <div className="carousel-controls"><button aria-label="Previous photograph" onClick={() => move(-1)}>←</button>
      <span aria-live={paused || focused ? 'polite' : 'off'}>{active + 1} / {count}</span>
      <button aria-label="Next photograph" onClick={() => move(1)}>→</button>
      <button aria-pressed={paused} onClick={() => setPaused(p => !p)}>{paused ? 'Play slideshow' : 'Pause slideshow'}</button></div>}
  </section>;
}

export default function GalleryCarousel() {
  const state = useGallery({ featured: true });
  return <GalleryCarouselView {...state} />;
}
