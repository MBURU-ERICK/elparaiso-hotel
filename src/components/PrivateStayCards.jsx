import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerRequest } from '../customer/customerApi';
function StayCard({ unit }) {
  const [index, setIndex] = useState(0);
  const images = unit.images?.length ? unit.images : ['/images/hotel-room.jpg'];
  useEffect(() => { if (images.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const timer = setInterval(() => setIndex(i => (i + 1) % images.length), 5000); return () => clearInterval(timer); }, [images.length]);
  return <article className="private-stay-card"><div className="private-card-image"><img src={images[index % images.length]} alt={`${unit.name} — view ${index + 1}`} loading="lazy" /><span className="private-card-tag">PRIVATE STAY</span>{images.length > 1 && <div className="private-card-dots">{images.map((_, i) => <button key={i} aria-label={`Show photo ${i + 1} of ${unit.name}`} aria-pressed={index === i} onClick={() => setIndex(i)} />)}</div>}</div><div className="private-card-copy"><small>{unit.property_name}</small><h3>{unit.name}</h3><p>{unit.max_guests} guests · {unit.bedrooms} bedrooms · {unit.bathrooms} bathrooms</p><p>{unit.description}</p><div><strong>KES {Number(unit.nightly_rate).toLocaleString()} <small>/ night</small></strong><Link to={`/booking?service=airbnb&unit=${unit.id}&facility=${unit.facility}&selection=${encodeURIComponent(unit.name)}`}>Enquire ↗</Link></div></div></article>;
}
export default function PrivateStayCards({ hero = false }) {
  const [units, setUnits] = useState(null); const [error, setError] = useState('');
  useEffect(() => { customerRequest('/api/shortstays/units/').then(d => setUnits(d.results || d)).catch(() => setError('Private stays are available on request. Contact our team for current room options.')); }, []);
  return <section className={hero ? 'private-stays home-private-stays' : 'private-stays'}><div className="private-stays-heading"><div><span className="eyebrow">A LITTLE MORE SPACE. ALL YOUR OWN.</span><h2>Your home in Laikipia.</h2></div><Link to="/airbnb">Explore private stays ↗</Link></div>{error && <p role="status">{error}</p>}{!units && !error && <p role="status">Discovering your next stay…</p>}<div className="private-stay-grid">{units?.slice(0, hero ? 3 : undefined).map(unit => <StayCard key={unit.id} unit={unit} />)}</div>{units?.length === 0 && <p>Planning a private escape? <Link to="/booking?service=airbnb">Ask our team about available stays →</Link></p>}</section>;
}
