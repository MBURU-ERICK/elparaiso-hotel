import { Link } from 'react-router-dom';
import { ArrowUpRight, BedDouble, CalendarDays, Camera, Mail, MapPin, MessageCircle, Phone, Sun, Utensils } from 'lucide-react';
import ContactLinks from './ContactLinks';
import './footer-premium.css';

const explore = [['Accommodation', '/rooms'], ['Private stays', '/private-stays'], ['Restaurant', '/restaurant'], ['Experiences', '/experiences']];
const plan = [['Events & groups', '/events-groups'], ['Conferences', '/conferences'], ['Gallery', '/gallery'], ['About Elparaiso', '/about'], ['Contact', '/contact']];
const moments = [[BedDouble, 'REST & RECHARGE', 'A room to call your own', '/rooms'], [Utensils, 'SAVOUR THE MOMENT', 'Good food. Better company.', '/restaurant'], [CalendarDays, 'COME TOGETHER', 'Make an occasion of it', '/events-groups']];
const directions = 'https://www.google.com/maps/search/?api=1&query=Elparaiso+Hotel+Rumuruti+Kenya';

export default function Footer() {
  return <footer className="footer footer-premium">
    <div className="footer-inner">
      <div className="footer-invitation">
        <div className="footer-welcome-copy"><span className="footer-kicker"><Sun size={17} aria-hidden="true" /> A LITTLE WARMTH. A LOT TO LOOK FORWARD TO.</span><h2>Come for a moment.<br /><em>Leave with a memory.</em></h2><p>Your table, your favourite corner, your next getaway.<br />We’d love to welcome you to Elparaiso.</p></div>
        <div className="footer-invitation-actions"><Link className="footer-book" to="/booking">Let’s plan your visit <ArrowUpRight size={23} aria-hidden="true" /></Link><Link className="footer-gallery-link" to="/gallery"><Camera size={17} aria-hidden="true" /> Take a little look around <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      </div>
      <nav className="footer-moments" aria-label="Find your Elparaiso experience">{moments.map(([Icon, eyebrow, title, url]) => <Link key={url} to={url}><span className="footer-moment-icon"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><span><small>{eyebrow}</small><strong>{title}</strong></span><ArrowUpRight size={19} className="footer-moment-arrow" aria-hidden="true" /></Link>)}</nav>
      <div className="footer-premium-grid">
        <div className="footer-identity"><Link to="/" aria-label="Elparaiso Hotel homepage"><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel — Simply Amazing" width="1970" height="800" loading="lazy" /></Link><p>A place to pause. A reason to return.<br />Stays, shared tables and time together<br />in the heart of Laikipia.</p><a className="footer-place" href={directions}><MapPin size={15} aria-hidden="true" /> Rumuruti, Kenya <ArrowUpRight size={14} aria-hidden="true" /></a><span className="footer-signature">Simply Amazing.</span></div>
        <nav aria-label="Footer explore"><h3>Discover</h3>{explore.map(([label, url]) => <Link key={url} to={url}>{label}</Link>)}</nav>
        <nav aria-label="Footer plan your visit"><h3>Make a plan</h3>{plan.map(([label, url]) => <Link key={url} to={url}>{label}</Link>)}</nav>
        <div className="footer-contacts"><h3>A real conversation</h3><p>Speak directly with the people<br />looking after your visit.</p><div className="footer-phone-links"><Phone size={16} aria-hidden="true" /><ContactLinks /></div><a className="footer-email" href="mailto:elparaisohotelltd@gmail.com"><Mail size={16} aria-hidden="true" /><span>elparaisohotelltd@gmail.com</span></a><details className="footer-whatsapp"><summary><MessageCircle size={18} aria-hidden="true" /><span>Let’s chat on WhatsApp</span><ArrowUpRight size={16} aria-hidden="true" /></summary><ContactLinks whatsapp /></details></div>
      </div>
      <div className="footer-find-strip"><span><MapPin size={17} aria-hidden="true" /><span>Your next good memory is in <strong>Rumuruti, Laikipia.</strong></span></span><a href={directions}>Find your way here <ArrowUpRight size={17} aria-hidden="true" /></a></div>
      <div className="footer-premium-bottom"><span>© {new Date().getFullYear()} Elparaiso Hotel. All rights reserved.</span><span className="footer-made-for">STAY. SAVOUR. COME TOGETHER.</span><Link to="/contact">We’re here to help <ArrowUpRight size={13} aria-hidden="true" /></Link></div>
    </div>
  </footer>;
}
