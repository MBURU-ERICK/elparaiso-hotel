import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerRequest } from '../customer/customerApi';
import SEO from '../components/SEO';
export default function Events({ embedded = false }) {
  const [events, setEvents] = useState(null), [error, setError] = useState('');
  useEffect(() => { let active = true; customerRequest('/api/content/').then(d => { if (active) setEvents(d.events); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  const Heading = embedded ? 'h2' : 'h1';
  return <section className="section event-section">{!embedded && <SEO title="Events & Celebrations" description="Discover events and celebrations at Elparaiso Hotel in Rumuruti." path="/events" />}<span className="eyebrow">MAKE IT AN OCCASION</span><Heading>What’s happening at Elparaiso</Heading><p>Discover gatherings, celebrations and experiences worth coming together for.</p>{error && <p role="alert">Events could not be loaded. Please try again later.</p>}{!events && !error && <p role="status">Loading events…</p>}{events?.length === 0 && <p>Planning something special? Talk to us about hosting your next event.</p>}<div className="event-cards">{events?.map(event => <article className="event-card" key={event.id}>{event.image && <img src={event.image} alt={event.title} loading="lazy" />}<div><span className="eyebrow">{event.type_name}</span><h2>{event.title}</h2>{event.start_date && <p><time dateTime={event.start_date}>{event.start_date}</time>{event.end_date && ` — ${event.end_date}`}</p>}<p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p><Link className="text-link" to="/booking?service=conference">Enquire about this event →</Link></div></article>)}</div><Link className="portal-button" to="/booking?service=conference">Plan your own event →</Link></section>;
}
