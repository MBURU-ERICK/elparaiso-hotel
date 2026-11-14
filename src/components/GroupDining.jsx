import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Users, Utensils } from 'lucide-react';
import { LivePhoto } from './HomeLive';
import ContactLinks from './ContactLinks';
import './group-dining.css';
export default function GroupDining() {
  return <section className="group-dining" aria-labelledby="group-dining-title"><div className="group-dining-photo"><LivePhoto category="restaurant" /><span className="group-dining-caption">THE ELPARAISO TABLE · RUMURUTI</span></div><div className="group-dining-copy"><span className="group-dining-kicker">FAMILY & GROUP DINING</span><h2 id="group-dining-title">Make room<br />for <em>everyone.</em></h2><p className="group-dining-intro">A shared table. A little more time. Bring your people together and let’s plan a meal around you.</p><ol className="group-dining-steps"><li><CalendarDays size={20} /><span><strong>Choose your moment</strong><small>Share your preferred date.</small></span></li><li><Users size={20} /><span><strong>Bring your people</strong><small>Tell us how many are joining.</small></span></li><li><Utensils size={20} /><span><strong>Make it your meal</strong><small>Let us know your dining and dietary requirements.</small></span></li></ol><Link className="group-dining-button" to="/conference-meals">Plan a meal together <ArrowUpRight size={19} /></Link><p className="group-dining-note">Our team will confirm the menu, availability and quotation with you.</p><div className="group-dining-contact"><span>Prefer a conversation?</span><ContactLinks whatsapp /></div></div></section>;
}
