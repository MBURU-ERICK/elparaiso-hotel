import ContactLinks from '../components/ContactLinks';
import { useEffect, useState } from 'react';
import { customerRequest } from '../customer/customerApi';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [directoryError, setDirectoryError] = useState('');
  useEffect(() => { let active = true; customerRequest('/api/content/').then(d => { if (active) setContacts(d.contacts); }).catch(() => { if (active) setDirectoryError('Our contact directory is temporarily unavailable. Please use our main contact details.'); }); return () => { active = false; }; }, []);
  return <main><SEO title="Contact & Reservations" description="Contact Elparaiso Hotel in Rumuruti. Request group accommodation, conference quotations and services through your customer portal." path="/contact" />
    <section className="contact-hero"><div className="contact-overlay" /><div className="contact-hero-content"><span className="eyebrow">WE WOULD LOVE TO HEAR FROM YOU</span><h1>Let’s make your visit special.</h1><p>Good hospitality begins with a conversation.</p></div></section>
    <section className="contact-section section"><div className="contact-info"><span className="eyebrow">GET IN TOUCH</span><h2>We’re here to help.</h2><p>For bookings, group accommodation, meetings or a tailored service, use your customer portal to keep every detail in one place.</p><div className="contact-detail"><div><h3>Visit us</h3><p>Rumuruti, Laikipia County, Kenya</p></div></div><div className="contact-detail"><div><h3>Call our team</h3><ContactLinks /></div></div><div className="contact-detail"><div><h3>Email</h3><a href="mailto:elparaisohotelltd@gmail.com">elparaisohotelltd@gmail.com</a></div></div><p>Contact our team for current service hours.</p></div>
    <div className="portal-panel contact-portal"><span className="eyebrow">YOUR REQUEST, TAKEN CARE OF</span><h2>A simpler way to plan.</h2><p>Send your requirements, follow replies, receive email updates and review invoices without searching through chat messages.</p><Link className="portal-button" to="/booking?service=conference">Start a service request →</Link><p>For an update on an existing booking, reply to your confirmation email and include your booking reference.</p></div></section>
    <section className="section"><span className="eyebrow">MEET YOUR CONTACTS</span><h2>The people here to help</h2>{directoryError && <p role="status">{directoryError}</p>}<div className="event-cards">{contacts.map(contact => <article className="portal-panel" key={contact.id}><h3>{contact.name}</h3><strong>{contact.title}</strong><p>{contact.department}</p>{contact.phone && <p><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>}{contact.email && <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>}</article>)}</div></section>
    <section className="contact-map"><iframe title="Elparaiso Hotel area in Rumuruti, Laikipia" src="https://www.google.com/maps?q=Rumuruti,Laikipia,Kenya&output=embed" width="100%" height="350" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ border: 0 }} /></section></main>;
}
