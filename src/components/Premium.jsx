import { Link } from 'react-router-dom';
import { LivePhoto } from './HomeLive';
export function PageHero({ title, copy, category = 'general', label = 'ELPARAISO · RUMURUTI', to = '/booking', action = 'Plan your visit' }) {
  return <section className="premium-hero"><LivePhoto category={category} hero /><div className="premium-hero-copy"><span className="premium-pill">{label}</span><h1>{title}</h1><p>{copy}</p><div className="premium-actions"><Link className="premium-button" to={to}>{action} ↗</Link><Link className="premium-button" to="/contact">Contact our team</Link></div></div></section>;
}
export function ServiceCard({ title, copy, category, to, label = 'DISCOVER ELPARAISO' }) {
  return <article className="premium-card">{category && <LivePhoto category={category} />}<div className="premium-card-copy"><span className="premium-pill">{label}</span><h3>{title}</h3><p>{copy}</p><Link to={to}>Explore & enquire ↗</Link></div></article>;
}
export function VisitCTA({ title = 'Come discover Elparaiso for yourself' }) {
  return <section className="premium-section premium-cta"><span className="premium-pill">SIMPLY AMAZING.</span><h2>{title}</h2><p>Your next stay, meal or gathering begins with a conversation.</p><div className="premium-actions"><Link className="premium-button" to="/booking">Book your stay</Link><Link className="premium-button" to="/experiences">Explore our experiences</Link><Link className="premium-button" to="/contact">Contact us</Link></div></section>;
}
export function PlanningFAQ() {
  return <section className="premium-section"><h2>A few helpful details.</h2><div className="premium-faq"><details><summary>How do I confirm my visit?</summary><p>Send a request with your dates and requirements. Our team replies by email with availability and a quotation. Your request becomes a confirmed booking when our team confirms it.</p></details><details><summary>Can you arrange meals and accommodation for a group?</summary><p>Share your guest numbers, room preferences and catering requirements. Our team will confirm suitable arrangements and pricing.</p></details><details><summary>Where can I check policies and facilities?</summary><p>Ask our team before booking about check-in times, cancellation terms, children, accessibility and any equipment or facilities you need.</p></details></div></section>;
}
