import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import GalleryGrid from '../components/GalleryGrid';
import { useGallery } from '../hooks/useGallery';
import { galleryCategories } from '../services/galleryApi';
function GalleryResults({ category }) {
  const [page, setPage] = useState(1);
  const state = useGallery({ category, page });
  return <><GalleryGrid {...state} />{(page > 1 || state.count > 24) && <nav className="gallery-pagination" aria-label="Gallery pages">
    <button disabled={page === 1 || state.loading} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page}</span>
    <button disabled={state.loading || page * 24 >= state.count} onClick={() => setPage(p => p + 1)}>Next</button></nav>}</>;
}
export default function Gallery() {
  const [category, setCategory] = useState('');
  return <main><SEO title="Gallery" description="Explore Elparaiso Hotel accommodation, dining and outdoor spaces in Rumuruti." path="/gallery" />
    <section className="gallery-hero"><div className="gallery-overlay" /><div className="gallery-hero-content">
      <span className="eyebrow">A GLIMPSE OF ELPARAISO</span><h1>Moments Worth Remembering</h1><p>Explore the spaces and experiences waiting for you.</p></div></section>
    <section className="gallery-section section"><div className="section-heading"><span className="eyebrow">OUR GALLERY</span><h2>Explore Elparaiso</h2></div>
      <div className="gallery-filters" role="group" aria-label="Filter photographs">{['', ...galleryCategories].map(value => <button key={value} className={`gallery-filter ${value === category ? 'active' : ''}`} aria-pressed={value === category} onClick={() => setCategory(value)}>{value || 'All'}</button>)}</div>
      <GalleryResults key={category} category={category} /></section>
    <section className="gallery-cta"><h2>Your Elparaiso Experience Awaits</h2><Link to="/booking" className="btn btn-gold">Plan Your Stay</Link></section>
  </main>;
}
