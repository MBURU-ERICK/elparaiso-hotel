import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Expand } from 'lucide-react';
import EventDetailsDialog from './EventDetailsDialog';

export default function EventCarousel({ events = [] }) {
  const track = useRef(null);
  const trackId = useId();
  const [selected, setSelected] = useState(null);
  const [position, setPosition] = useState({ first: 0, atStart: true, atEnd: false });

  function measure() {
    const element = track.current;
    if (!element) return;
    const step = (element.children[0]?.getBoundingClientRect().width || 0) + 24;
    setPosition({ first: Math.max(0, Math.round(element.scrollLeft / step)), atStart: element.scrollLeft < 2, atEnd: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
  }
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const frame = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); };
  }, [events.length]);

  function move(direction) {
    const element = track.current;
    const step = (element.children[0]?.getBoundingClientRect().width || element.clientWidth) + 24;
    element.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  if (!events.length) return null;
  return <section className="event-carousel" aria-label="Events at Elparaiso" aria-roledescription="carousel">
    <div className="event-carousel-heading"><p>Explore our events. Select an image to see the full poster and details.</p>{events.length > 1 && <div className="event-carousel-controls"><button type="button" aria-label="Previous events" aria-controls={trackId} disabled={position.atStart} onClick={() => move(-1)}><ArrowLeft size={20} /></button><button type="button" aria-label="Next events" aria-controls={trackId} disabled={position.atEnd} onClick={() => move(1)}><ArrowRight size={20} /></button></div>}</div>
    <div ref={track} id={trackId} className="event-carousel-track" tabIndex={0} aria-label="Event cards; use left and right arrow keys to browse" onScroll={measure} onKeyDown={e => { if (e.target === e.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); move(e.key === 'ArrowLeft' ? -1 : 1); } }}>
      {events.map((event, index) => <article className="stay-listing event-listing" key={event.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${events.length}: ${event.title}`}>
        <button type="button" className="stay-listing-photo event-image-button" aria-label={`View ${event.title} image and details`} aria-haspopup="dialog" onClick={() => setSelected(event)}>
          {event.image ? <img src={event.image} alt={event.title} loading="lazy" decoding="async" /> : <span className="stay-photo-empty"><CalendarDays size={42} /><span>View event details</span></span>}
          <span className="event-expand"><Expand size={17} /> View details</span>
        </button>
        <div className="stay-card-heading"><h3><button type="button" onClick={() => setSelected(event)} aria-haspopup="dialog">{event.title}</button></h3></div>
        <p className="event-type">{event.type_name}</p>
        <p className="event-date">{event.start_date ? <><time dateTime={event.start_date}>{event.start_date}</time>{event.end_date && event.end_date !== event.start_date && <> — <time dateTime={event.end_date}>{event.end_date}</time></>}</> : 'Contact us for dates'}</p>
        <p className="event-card-description">{event.description}</p>
        <Link className="text-link event-book-link" to={`/booking?service=event&event=${event.id}`}>Book this event →</Link>
      </article>)}
    </div>
    {events.length > 1 && <p className="event-carousel-status" role="status">Browsing event {Math.min(position.first + 1, events.length)} of {events.length} · Swipe or use the arrows to explore</p>}
    {selected && <EventDetailsDialog event={selected} onDismiss={() => setSelected(null)} />}
  </section>;
}
