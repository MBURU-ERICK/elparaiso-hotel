import { Link } from 'react-router-dom';
import { ArrowUpRight, BedDouble, Leaf, MessageCircle, Utensils } from 'lucide-react';
import ContactLinks from '../components/ContactLinks';
import { FeaturedStays } from '../components/HomeLive';
import { ServiceCard, VisitCTA } from '../components/Premium';
import EditorialPhoto from '../components/EditorialPhoto';
import PublishedReviews from '../components/PublishedReviews';
import SEO from '../components/SEO';
import BookingBar from '../components/BookingBar';
import HotelAmenities from '../components/HotelAmenities';
import { services } from '../data/services';
import { homeContent } from '../data/home';
import '../styles/home.css';
export default function Home() {
  return <main className="home-rebuilt elegant-home garden-home"><SEO title="Hotel & Restaurant in Rumuruti, Laikipia" description="Official website of Elparaiso Hotel & Restaurant in Rumuruti, Laikipia. Discover beautiful rooms, private stays, dining, gardens and occasions, and plan your visit directly with our team." path="/" />
    <section className="garden-hero" aria-labelledby="garden-hero-title"><div className="garden-hero-copy"><span className="garden-context">Elparaiso Hotel & Restaurant</span><h1 id="garden-hero-title">A garden escape.<br />A Kenyan welcome.</h1><p>Comfortable rooms, private stays, shared tables and time outdoors. Make yourself at home in Rumuruti, Laikipia.</p><div className="premium-actions"><Link className="premium-button" to="/booking">Plan your stay <ArrowUpRight size={17} aria-hidden="true" /></Link><Link className="elegant-text-link" to="/gallery">See Elparaiso in pictures</Link></div><span className="garden-hero-address">Rumuruti, Laikipia County, Kenya</span></div><EditorialPhoto category="garden" hero sizes="(min-width: 901px) 55vw, 90vw" caption="The gardens at Elparaiso" /></section>
    <nav className="garden-visit-paths" aria-label="Explore the hotel and garden"><Link to="/rooms"><BedDouble size={22} strokeWidth={1.4} aria-hidden="true" /><span>Stay a little longer<small>Hotel rooms in Rumuruti</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/restaurant"><Utensils size={22} strokeWidth={1.4} aria-hidden="true" /><span>Come around the table<small>Restaurant & group dining</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/experiences"><Leaf size={22} strokeWidth={1.4} aria-hidden="true" /><span>Spend time outdoors<small>Gardens & shared moments</small></span><ArrowUpRight size={17} aria-hidden="true" /></Link></nav>
    <BookingBar />
    <section className="elegant-welcome"><div><h2>A hotel, a garden,<br />a place to gather.</h2></div><p>Come for a night. Gather for a day. Stay for the moments in between. From a comfortable room to a meal with your favourite people, make a little time for Elparaiso.</p><Link className="elegant-text-link" to="/about">Get to know us <ArrowUpRight size={17} aria-hidden="true" /></Link></section>
    <section className="premium-section elegant-home-collection"><header className="elegant-section-heading"><div><h2>Many ways to feel at home.</h2></div><p>A stay, a meal, a little space to yourself.<br />Choose the experience that brings you here.</p></header><div className="premium-grid">{services.filter(item => ['ACCOMMODATION', 'PRIVATE STAYS', 'RESTAURANT'].includes(item.label)).map(service => <ServiceCard key={service.to} {...service} />)}</div></section>
    <FeaturedStays />
    <section className="elegant-private-feature"><EditorialPhoto category="airbnb" /><div><span className="garden-context">Private accommodation</span><h2>Your own space.<br />Your own pace.</h2><p>Unpack, settle in, and make the days your own. Discover the rooms, details and grounds of our private-stay collection.</p><Link className="premium-button" to="/private-stays">Discover private stays <ArrowUpRight size={17} aria-hidden="true" /></Link></div></section>
    <section className="premium-section tint"><header className="elegant-section-heading"><div><h2>Make a little more of the moment.</h2></div><p>Time outdoors. A celebration.<br />A meeting of minds.</p></header><div className="premium-grid">{services.filter(item => ['GARDEN', 'EVENTS & GROUPS', 'CONFERENCES'].includes(item.label)).map(service => <ServiceCard key={service.to} {...service} />)}</div></section>
    <HotelAmenities />
    <PublishedReviews compact />
    <section className="elegant-direct"><div><BedDouble size={23} strokeWidth={1.3} aria-hidden="true" /><h3>A stay that suits you</h3><p>Compare room options, guest capacities and current nightly rates.</p></div><div><Utensils size={23} strokeWidth={1.3} aria-hidden="true" /><h3>Make it an occasion</h3><p>Share your plans for a meal, conference or gathering with our team.</p></div><div><MessageCircle size={23} strokeWidth={1.3} aria-hidden="true" /><h3>A personal conversation</h3><p>Plan directly with the people looking after your visit.</p></div></section>
    <section className="home-section home-find"><div><h2>See you in Rumuruti.</h2><p>Elparaiso Hotel & Restaurant<br />Rumuruti, Laikipia County, Kenya</p><p>Planning your journey? Open directions and contact our team for help with the final approach.</p><div className="home-directions">{homeContent.origins.map(origin => <a key={origin} href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin + ', Kenya')}&destination=${encodeURIComponent('Elparaiso Hotel Rumuruti Kenya')}`}>From {origin} ↗</a>)}</div><ContactLinks /></div><iframe title="Map search for Elparaiso Hotel in Rumuruti" src="https://www.google.com/maps?q=Elparaiso+Hotel+Rumuruti+Kenya&output=embed" width="720" height="480" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></section>
    <VisitCTA title="Your next memory begins at Elparaiso." />
  </main>;
}
