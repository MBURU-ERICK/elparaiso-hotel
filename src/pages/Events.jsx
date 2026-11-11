import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerRequest } from '../customer/customerApi';
import SEO from '../components/SEO';
import EventCarousel from '../components/EventCarousel';
import '../styles/events.css';

export default function Events({ embedded = false }) {
  const [events, setEvents] = useState(null), [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    customerRequest('/api/content/').then(data => { if (active) { setEvents(data.events); setError(''); } }).catch(() => { if (active) setError('Events could not be loaded. Please try again.'); });
    return () => { active = false; };
  }, [revision]);
  const Heading = embedded ? 'h2' : 'h1';
  return <section className="section event-section">
    {!embedded && <SEO title="Events & Celebrations" description="Discover events and celebrations at Elparaiso Hotel in Rumuruti." path="/events" />}
    <header className="explore-intro"><div><span className="eyebrow">MAKE IT AN OCCASION</span><Heading>What’s happening at Elparaiso</Heading><p>Discover gatherings, celebrations and experiences worth coming together for.</p></div></header>
    {error && <div className="explorer-state" role="alert"><p>{error}</p><button onClick={() => { setError(''); setRevision(n => n + 1); }}>Try again</button></div>}
    {!events && !error && <p role="status">Loading events…</p>}
    {events?.length === 0 && <div className="explorer-state"><h2>Make your next occasion special.</h2><p>Talk to us about hosting your next event.</p></div>}
    {events?.length > 0 && <EventCarousel events={events} />}
    <div className="event-plan"><h2>Have an occasion in mind?</h2><p>Bring your people. We’ll help with the details.</p><Link className="portal-button" to="/booking?service=event">Plan your own event →</Link></div>
  </section>;
}
