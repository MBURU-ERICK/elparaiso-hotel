import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import { useHomeResource } from '../hooks/useHomeResource';
import { getRoomTypes } from '../services/bookingApi';
import { summarizeRoomAmenities } from '../utils/roomAmenities';

export function HotelAmenitiesView({ rooms = [], loading, error, retry }) {
  const features = summarizeRoomAmenities(rooms);
  return <section className="garden-amenities" aria-labelledby="garden-amenities-title"><header><span className="garden-context">Room features</span><h2 id="garden-amenities-title">The details that make it yours.</h2><p>Explore features listed for selected hotel rooms. Check your chosen room for exactly what is included.</p><Link className="elegant-text-link" to="/rooms">Compare hotel rooms <ArrowUpRight size={16} aria-hidden="true" /></Link></header><div>
    {loading ? <p role="status">Loading room features…</p> : features.length ? <ul className="garden-amenity-list">{features.slice(0, 12).map(feature => <li key={feature.name}><Check size={17} aria-hidden="true" /><span><strong>{feature.name}</strong><small>Listed in {feature.categories} {feature.categories === 1 ? 'room category' : 'room categories'}</small></span></li>)}</ul> : <p className="garden-amenity-empty">See the room descriptions for available amenities, or <Link to="/contact">ask our team about what you need</Link>.</p>}
    {error && <p className="garden-amenity-note" role="status">Some room details could not be refreshed. <button type="button" onClick={retry}>Try again</button></p>}
    {features.length > 12 && <p className="garden-amenity-note">Explore the room collection for more features and individual room details.</p>}
  </div></section>;
}
export default function HotelAmenities() {
  const { data, error, retry } = useHomeResource('hotel-rooms', getRoomTypes);
  const rooms = Array.isArray(data) ? data : data?.results || [];
  return <HotelAmenitiesView rooms={rooms} loading={!data && !error} error={error} retry={retry} />;
}
