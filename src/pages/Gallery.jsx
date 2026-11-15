import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, Camera, Expand, Images, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import GalleryGrid from '../components/GalleryGrid';
import GalleryLightbox from '../components/GalleryLightbox';
import { useGallery } from '../hooks/useGallery';
import { galleryCategories } from '../services/galleryApi';
import '../styles/gallery-journal.css';
const labels = { rooms: 'Hotel rooms', restaurant: 'At the table', garden: 'In the garden', airbnb: 'Private stays', experiences: 'Little moments', general: 'Around Elparaiso' };

function GalleryResults({ category }) {
  const [page, setPage] = useState(1);
  const state = useGallery({ category, page });
  return <><div className="journal-results-heading"><span><Images size={16} aria-hidden="true" />{category ? labels[category] : 'The whole picture'}</span><span role="status">{!state.loading && !state.error ? `${state.count} ${state.count === 1 ? 'photograph' : 'photographs'}` : 'A closer look at Elparaiso'}</span></div><GalleryGrid key={page} {...state} />{(page > 1 || state.count > 24) && <nav className="gallery-pagination journal-pagination" aria-label="Gallery pages">
    <button disabled={page === 1 || state.loading} onClick={() => setPage(p => p - 1)}><ArrowLeft size={17} /> Previous</button><span>Page {page}{state.count > 0 && ` of ${Math.ceil(state.count / 24)}`}</span>
    <button disabled={state.loading || page * 24 >= state.count} onClick={() => setPage(p => p + 1)}>Next <ArrowRight size={17} /></button></nav>}</>;
}
function GallerySpotlight() {
  const { images, loading } = useGallery();
  const [selected, setSelected] = useState(null);
  const photos = images.slice(0, 3);
  return <div data-photo-count={photos.length} className={`journal-hero-collage${!photos.length ? ' is-empty' : ''}`}>
    {photos.map((photo, index) => <button type="button" key={photo.id} className={`journal-hero-photo journal-hero-photo-${index + 1}`} aria-label={`View ${photo.title} photograph`} aria-haspopup="dialog" onClick={() => setSelected(index)}><img src={photo.image_url} srcSet={`${photo.thumbnail_url || photo.image_url} 640w, ${photo.image_url} 1920w`} sizes={index === 0 ? '(min-width: 900px) 40vw, 85vw' : '25vw'} alt={photo.alt_text || photo.title} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} /><span><Expand size={17} /> {photo.title}</span></button>)}
    {!photos.length && <div className="journal-hero-placeholder"><Camera size={48} strokeWidth={1} /><span>{loading ? 'A little glimpse is on its way…' : 'Your next memory begins here.'}</span></div>}
    <span className="journal-collage-note">Stay a little. Look a little closer.</span>
    {selected !== null && <GalleryLightbox images={images} initialIndex={selected} onClose={() => setSelected(null)} />}
  </div>;
}
export default function Gallery() {
  const [category, setCategory] = useState('');
  return <main className="gallery-journal"><SEO title="Hotel, Restaurant & Garden Photo Gallery" description="Take a closer look at Elparaiso Hotel in Rumuruti. Browse rooms, gardens, dining and memorable moments in our interactive photo gallery." path="/gallery" />
    <section className="journal-hero"><div className="journal-hero-copy"><span className="journal-kicker"><span /> THE ELPARAISO PHOTO JOURNAL</span><h1>A little glimpse.<br /><em>A lovely feeling.</em></h1><p>Sunlit spaces. Shared tables. Quiet corners.<br />Picture yourself here, one moment at a time.</p><a className="journal-explore" href="#photo-collection">Explore the photographs <ArrowDown size={18} /></a><span className="journal-location"><MapPin size={14} /> RUMURUTI, LAIKIPIA · KENYA</span></div><GallerySpotlight /></section>
    <section className="journal-collection" id="photo-collection" aria-labelledby="photo-collection-title"><header className="journal-collection-heading"><div><span className="eyebrow">THROUGH OUR LENS</span><h2 id="photo-collection-title">Find your favourite corner.</h2></div><p><Expand size={16} aria-hidden="true" /> Tap any photograph to take a closer look.</p></header>
      <div className="journal-filters" role="group" aria-label="Filter photographs">{['', ...galleryCategories].map(value => <button key={value} type="button" aria-pressed={value === category} onClick={() => setCategory(value)}>{value === '' && <Images size={15} aria-hidden="true" />}{labels[value] || 'All moments'}</button>)}</div>
      <GalleryResults key={category} category={category} /></section>
    <section className="journal-closing"><Camera size={30} strokeWidth={1} aria-hidden="true" /><span className="eyebrow">THE BEST PART? BEING HERE.</span><h2>Turn a little inspiration<br /><em>into your next memory.</em></h2><p>There’s a place for you at Elparaiso. Let’s plan your visit.</p><Link to="/booking">Make yourself at home <ArrowRight size={18} /></Link></section>
  </main>;
}
