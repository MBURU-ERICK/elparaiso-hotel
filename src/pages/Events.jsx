import { LivePhoto } from '../components/HomeLive';
import GuestBooking from './GuestBooking';
import { PageHero, PlanningFAQ, VisitCTA } from '../components/Premium';
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
  const Heading = 'h2';
  const Container = embedded ? 'div' : 'main';
  return <Container className="premium-page">{!embedded && <PageHero title="Celebrate Every Moment at Elparaiso" copy="From meaningful gatherings to memorable celebrations, discover a welcoming setting for your next occasion." category="celebrations" to="/booking?service=event" action="Plan your occasion" />}<section className="section event-section">
    {!embedded && <SEO title="Events & Celebrations" description="Discover events and celebrations at Elparaiso Hotel in Rumuruti." path="/events-groups" />}
    <header className="explore-intro"><div><span className="eyebrow">MAKE IT AN OCCASION</span><Heading>What’s happening at Elparaiso</Heading><p>Discover gatherings, celebrations and experiences worth coming together for.</p></div></header>
    {error && <div className="explorer-state" role="alert"><p>{error}</p><button onClick={() => { setError(''); setRevision(n => n + 1); }}>Try again</button></div>}
    {!events && !error && <div className="premium-grid" aria-label="Retrieving events" aria-busy="true">{[1,2,3].map(id => <div key={id} className="stay-skeleton" />)}</div>}
    {events?.length === 0 && <div className="explorer-state"><h2>Make your next occasion special.</h2><p>Talk to us about hosting your next event.</p></div>}
    {events?.length > 0 && <EventCarousel events={events} />}
    {!embedded && <section className="venue-editorial"><figure><LivePhoto category="celebrations" /><figcaption>A gathering setup at Elparaiso</figcaption></figure><div><span className="section-kicker">YOUR OCCASION, THOUGHTFULLY PLANNED</span><h2>Make room<br /><em>for a celebration.</em></h2><p>Start with the people who matter. Tell us your occasion, preferred date and guest count, and let’s discuss a setting, meals and accommodation that fit.</p><p>Layouts, capacity and services are agreed with our team before you confirm.</p><Link className="premium-button" to="/booking?service=event">Share your plans ↗</Link></div></section>}
    <div className="event-plan"><h2>Have an occasion in mind?</h2><p>Bring your people. We’ll help with the details.</p><Link className="portal-button" to="/booking?service=event">Plan your own event →</Link></div>
  </section>{!embedded && <><GuestBooking initialService="event" embedded /><PlanningFAQ /><VisitCTA title="Bring your people. We’ll help with the details." /></>}</Container>;
}
