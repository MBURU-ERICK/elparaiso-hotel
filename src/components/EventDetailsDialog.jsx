import { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function EventDetailsDialog({ event, onDismiss }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  return <dialog ref={dialog} className="event-dialog" aria-labelledby={titleId} onCancel={onDismiss} onClick={e => { if (e.target === e.currentTarget) onDismiss(); }}>
    <div className={`event-dialog-content${event.image ? '' : ' event-dialog-text-only'}`}>
      <button type="button" className="event-dialog-close" aria-label="Close event details" onClick={onDismiss} autoFocus><X size={22} /></button>
      {event.image && <div className="event-dialog-image"><img src={event.image} alt={event.title} /></div>}
      <div className="event-dialog-copy"><span className="eyebrow">{event.type_name}</span><h2 id={titleId}>{event.title}</h2>
        {event.start_date && <p><time dateTime={event.start_date}>{event.start_date}</time>{event.end_date && event.end_date !== event.start_date && <> — <time dateTime={event.end_date}>{event.end_date}</time></>}</p>}
        <p className="event-full-description">{event.description}</p>
        <Link className="portal-button" to={`/booking?service=event&event=${event.id}`}>Book this event →</Link>
        {event.image && <a className="text-link" href={event.image} target="_blank" rel="noopener noreferrer">Open full image in a new tab ↗</a>}
      </div>
    </div>
  </dialog>;
}
