import { photography } from '../data/photography';
import ContactLinks from './ContactLinks';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getRoomTypes } from '../services/bookingApi';
import { shortstayApi } from '../services/shortstayApi';
import { galleryApi } from '../services/galleryApi';
import { useHomeResource } from '../hooks/useHomeResource';
const loaders = Object.fromEntries(['general', 'restaurant', 'experiences', 'garden', 'rooms', 'airbnb'].map(category => [category, () => galleryApi.list({ category })]));
const list = data => Array.isArray(data) ? data : data?.results || [];
export function HomePhoto(props) {
  return <PhotoAsset key={props.src || 'empty'} {...props} />;
}
function PhotoAsset({ src, thumbnail, alt, hero = false }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className={`home-photo ${ready ? 'is-ready' : ''}`}>
    {thumbnail && <img className="home-photo-blur" src={thumbnail} alt="" aria-hidden="true" width="960" height="720" loading={hero ? 'eager' : 'lazy'} decoding="async" />}
    {src && !failed ? <img ref={node => { if (node?.complete && node.naturalWidth > 0) setReady(true); }} src={src} srcSet={thumbnail && thumbnail !== src ? `${thumbnail} 640w, ${src} 1920w` : undefined} sizes={hero ? '100vw' : '(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw'} alt={alt} width="1920" height="1440" decoding="async" fetchPriority={hero ? 'high' : 'auto'} loading={hero ? 'eager' : 'lazy'} onLoad={() => setReady(true)} onError={() => setFailed(true)} /> : <span className="home-photo-empty">{failed ? 'Photograph unavailable' : 'Elparaiso · Rumuruti'}</span>}
  </div>;
}
export function LivePhoto({ category, hero = false, index = 0 }) {
  const { data } = useHomeResource(`photos:${category}`, loaders[category] || loaders.general);
  const photo = ['conference', 'celebrations'].includes(category) ? photography[category] : list(data)[index] || list(data)[0] || photography[category];
  return <HomePhoto src={photo?.image_url} thumbnail={photo?.thumbnail_url} alt={photo?.alt_text || 'Elparaiso Hotel, Rumuruti'} hero={hero} />;
}
export function FeaturedStays({ privateStay = false }) {
  const { data, error, retry } = useHomeResource(privateStay ? 'private-stays' : 'hotel-rooms', privateStay ? shortstayApi.units : getRoomTypes);
  const rows = list(data).slice(0, 3);
  return <section className="home-section home-stays"><header className="home-section-heading"><div><span className="home-kicker">{privateStay ? 'A LITTLE MORE SPACE' : 'SETTLE IN'}</span><h2>{privateStay ? 'A place of your own.' : 'Make yourself at home.'}</h2></div><Link to={privateStay ? '/private-stays' : '/rooms'}>Explore {privateStay ? 'private stays' : 'rooms'} ↗</Link></header>
    {error && <p role="status">{data ? 'Showing the last retrieved rates. Refresh for current details.' : 'Our stay options are taking a moment.'} <button type="button" onClick={retry}>Try again</button> or <ContactLinks />.</p>}
    <div className="home-stay-grid" aria-busy={!data && !error}>{!data && !error ? [1, 2, 3].map(n => <article className="home-stay-card home-skeleton" key={n} aria-label="Retrieving live stay options"><div /><span /><span /><span /></article>) : rows.map(room => {
      const rate = Number(room.nightly_rate);
      const photo = room.image_url || room.images?.[0]?.image_url || room.images?.[0];
      const query = new URLSearchParams({ service: privateStay ? 'airbnb' : 'hotel', [privateStay ? 'unit' : 'room_type']: room.id, selection: room.name });
      if (room.facility) query.set('facility', room.facility);
      return <article className="home-stay-card" key={room.id}><Link to={`/booking?${query}`}><HomePhoto src={typeof photo === 'string' ? photo : undefined} alt={room.name} /><div className="home-stay-copy"><span className="home-kicker">{privateStay ? 'PRIVATE STAY' : 'HOTEL ROOM'}</span><h3>{room.name}</h3><p>Up to {room.max_guests || room.max_occupancy} guests</p><strong>{Number.isFinite(rate) && rate > 0 ? `from KES ${rate.toLocaleString('en-KE')} / night` : 'Rate available on request'}</strong><span className="home-card-link">Request this stay ↗</span></div></Link></article>;
    })}</div>
    {data && !rows.length && <p>Our team can help you find a suitable stay. <Link to={`/booking?service=${privateStay ? 'airbnb' : 'hotel'}`}>Ask about current options ↗</Link></p>}
    <p className="home-fine-print">Rates depend on your room arrangement and dates. Availability and the final quotation are confirmed by our team.</p>
  </section>;
}
