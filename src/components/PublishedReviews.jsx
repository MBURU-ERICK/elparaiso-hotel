import { useEffect, useState } from 'react';
import { BadgeCheck, Quote, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { customerRequest } from '../customer/customerApi';
import '../styles/experience-reviews.css';

export default function PublishedReviews() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    customerRequest(`/api/customers/published-reviews/?page=${page}`).then(result => {
      if (active) { setData(result); setError(''); setLoading(false); }
    }).catch(() => { if (active) { setError('Guest stories could not be loaded.'); setLoading(false); } });
    return () => { active = false; };
  }, [page, revision]);
  function changePage(value) { setLoading(true); setPage(value); }
  return <section className="experience-reviews" aria-labelledby="guest-stories-title">
    <header className="guest-stories-heading"><div><span className="eyebrow">THE MOMENTS THAT STAY WITH YOU</span><h2 id="guest-stories-title">Our guests.<br /><em>Their Elparaiso.</em></h2></div><div><span className="guest-stories-seal"><BadgeCheck size={18} aria-hidden="true" /> Verified guest feedback</span><p>Little details. Warm welcomes. Time well spent. Read the experiences our guests have shared with us.</p></div></header>
    {loading && <p className="guest-stories-state" role="status">Gathering guest stories…</p>}
    {error && <div className="guest-stories-state" role="alert"><p>{error}</p><button type="button" onClick={() => { setLoading(true); setRevision(n => n + 1); }}>Try again</button></div>}
    {!loading && !error && data?.count === 0 && <div className="guest-stories-state"><Quote size={30} aria-hidden="true" /><h3>A little room for your story.</h3><p>Guest stories will appear here as our guests share their experiences. We look forward to welcoming you.</p></div>}
    {!loading && !error && data?.results?.length > 0 && <><p className="guest-stories-count">A selection of {data.count} published guest {data.count === 1 ? 'story' : 'stories'}</p><div className="guest-stories-grid">{data.results.map(review => <GuestStoryCard key={review.id} review={review} />)}</div>{data.count > 12 && <nav className="guest-stories-pages" aria-label="Guest story pages"><button type="button" disabled={!data.previous} onClick={() => changePage(page - 1)}><ArrowLeft size={16} /> Previous</button><span>Page {page} of {Math.ceil(data.count / 12)}</span><button type="button" disabled={!data.next} onClick={() => changePage(page + 1)}>Next <ArrowRight size={16} /></button></nav>}</>}
  </section>;
}

export function GuestStoryCard({ review }) {
  return <article className="guest-story-card">
      <div className="guest-story-top"><span className="guest-story-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} size={17} fill={n <= review.rating ? 'currentColor' : 'none'} aria-hidden="true" />)}</span><Quote size={30} strokeWidth={1} aria-hidden="true" /></div>
      <blockquote><p>{review.comment.length > 360 ? `${review.comment.slice(0, 360)}…` : review.comment}</p>{review.comment.length > 360 && <details><summary>Read full review</summary><p>{review.comment}</p></details>}</blockquote>
      <footer><span className="guest-story-avatar" aria-hidden="true">{review.display_name.charAt(0)}</span><div><h3>{review.display_name}</h3><span>{review.facility_name}</span></div><BadgeCheck className="guest-story-verified" size={20} aria-label="Verified guest" /></footer>
      <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' })}</time>
    </article>;
}
