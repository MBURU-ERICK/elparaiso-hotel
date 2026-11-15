import { ArrowUpRight, MapPin } from 'lucide-react';
import './editorial-cards.css';
import { Link } from 'react-router-dom';
import EditorialPhoto from './EditorialPhoto';
export function PageHero({ title, copy, category = 'general', label = 'ELPARAISO · RUMURUTI', to = '/booking', action = 'Plan your visit' }) {
  return <section className="premium-hero elegant-hero"><div className="premium-hero-copy"><span className="premium-pill">{label}</span><h1>{title}</h1><p>{copy}</p><div className="premium-actions"><Link className="premium-button" to={to}>{action} <ArrowUpRight size={17} aria-hidden="true" /></Link><Link className="elegant-hero-contact" to="/contact">A personal conversation <ArrowUpRight size={15} aria-hidden="true" /></Link></div><span className="elegant-hero-location"><MapPin size={13} aria-hidden="true" /> RUMURUTI · LAIKIPIA · KENYA</span></div><EditorialPhoto category={category} hero /></section>;
}
export function ServiceCard({ title, copy, category, to, label = 'DISCOVER ELPARAISO' }) {
  return <article className="premium-card" data-tone={category || 'general'}>{category && <EditorialPhoto category={category} sizes="(min-width: 1100px) 28vw, (min-width: 701px) 42vw, 90vw" />}<div className="premium-card-copy"><span className="premium-pill">{label}</span><h3>{title}</h3><p>{copy}</p><Link className="editorial-card-link" to={to}>Explore {label === 'DISCOVER ELPARAISO' ? title.toLowerCase() : label.toLowerCase()} <ArrowUpRight size={18} aria-hidden="true" /></Link></div></article>;
}
export function VisitCTA({ title = 'A lovely visit begins with a little inspiration.' }) {
  return <section className="premium-section premium-cta elegant-closing"><div><span className="premium-pill">YOUR NEXT GOOD MEMORY</span><h2>{title}</h2><p>A room, a shared table, a reason to come together. Let’s make it yours.</p></div><div className="premium-actions"><Link className="premium-button" to="/booking">Plan your visit <ArrowUpRight size={17} aria-hidden="true" /></Link><Link className="elegant-text-link" to="/contact">Speak with our team <ArrowUpRight size={15} aria-hidden="true" /></Link></div></section>;
}
export function PlanningFAQ() {
  return <section className="premium-section elegant-faq"><div><span className="eyebrow">THE LITTLE DETAILS</span><h2>A few things<br /><em>before you arrive.</em></h2><p>Our team is here to make planning your visit feel personal.</p></div><div className="premium-faq"><details><summary>How do I confirm my visit?</summary><p>Send a request with your dates and requirements. Our team replies by email with availability and a quotation. Your request becomes a confirmed booking when our team confirms it.</p></details><details><summary>Can you arrange meals and accommodation for a group?</summary><p>Share your guest numbers, room preferences and catering requirements. Our team will confirm suitable arrangements and pricing.</p></details><details><summary>Where can I check policies and facilities?</summary><p>Ask our team before booking about check-in times, cancellation terms, children, accessibility and any equipment or facilities you need.</p></details></div></section>;
}
