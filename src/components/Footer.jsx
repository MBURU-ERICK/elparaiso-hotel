import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin, MessageCircle } from 'lucide-react';
import ContactLinks from './ContactLinks';
import './footer-premium.css';
const links = [['Rooms', '/rooms'], ['Private stays', '/private-stays'], ['Dining', '/restaurant'], ['Experiences', '/experiences'], ['Gallery', '/gallery'], ['Contact', '/contact']];
export default function Footer() {
  return <footer className="footer footer-premium"><div className="footer-compact-inner">
    <div className="footer-compact-main"><div className="footer-compact-brand"><Link to="/" aria-label="Elparaiso Hotel homepage"><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel — Simply Amazing" width="1970" height="800" loading="lazy" /></Link><span>Thoughtful stays. Beautiful moments.</span></div><nav className="footer-compact-nav" aria-label="Explore Elparaiso">{links.map(([label, url]) => <Link key={url} to={url}>{label}</Link>)}</nav><Link className="footer-compact-book" to="/booking">Plan your stay <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    <div className="footer-compact-contact"><a href="https://www.google.com/maps/search/?api=1&query=Elparaiso+Hotel+Rumuruti+Kenya"><MapPin size={14} aria-hidden="true" /> Rumuruti, Laikipia</a><ContactLinks /><a href="mailto:elparaisohotelltd@gmail.com"><Mail size={14} aria-hidden="true" /><span>elparaisohotelltd@gmail.com</span></a><details><summary><MessageCircle size={15} aria-hidden="true" /> WhatsApp</summary><ContactLinks whatsapp /></details></div>
    <div className="footer-compact-bottom"><span>© {new Date().getFullYear()} Elparaiso Hotel. All rights reserved.</span><span>SIMPLY AMAZING.</span><Link to="/contact">A personal welcome awaits <ArrowUpRight size={12} aria-hidden="true" /></Link></div>
  </div></footer>;
}
