import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, MessageSquareHeart } from 'lucide-react';
import { customerRequest } from '../customer/customerApi';
export default function GuestReview() {
  const [params] = useSearchParams(), token = params.get('token') || '';
  const [eligibility, setEligibility] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [rating, setRating] = useState(0), [notice, setNotice] = useState('');
  useEffect(() => {
    if (!token) return;
    let active = true;
    customerRequest(`/api/customers/stay-review/?${new URLSearchParams({ token })}`).then(data => { if (active) setEligibility(data); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [token]);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const comment = new FormData(event.currentTarget).get('comment');
    try { const result = await customerRequest('/api/customers/stay-review/', { method: 'POST', body: JSON.stringify({ token, rating, comment }) }); setNotice(result.detail); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="section checkout-review-page"><div className="checkout-review-intro"><MessageSquareHeart size={38} /><span className="eyebrow">UNTIL WE WELCOME YOU AGAIN</span><h1>How was your stay?</h1><p>A little feedback helps us make the next welcome even better.</p></div>{!token ? <div className="portal-panel"><h2>Reviews open after checkout.</h2><p>Our team will email your personal review link once your checkout is recorded. You won’t need an account.</p><Link to="/contact">Contact our team →</Link></div> : notice ? <div className="portal-panel" role="status"><h2>Thank you for staying with us.</h2><p>{notice}</p><Link to="/">Return to Elparaiso →</Link></div> : <>{error && <p role="alert" className="portal-alert">{error}</p>}{!eligibility && !error && <p role="status">Checking your checkout details…</p>}{eligibility?.reviewed ? <div className="portal-panel"><h2>Thank you for your feedback.</h2><p>{eligibility.detail}</p></div> : eligibility && <form className="portal-form portal-panel" onSubmit={submit}><small>Verified checkout · {eligibility.reference}</small><fieldset className="checkout-star-rating"><legend>Your overall rating</legend><div>{[1, 2, 3, 4, 5].map(value => <label key={value}><input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} required /><Star size={30} fill={value <= rating ? 'currentColor' : 'none'} /><span>{value} {value === 1 ? 'star' : 'stars'}</span></label>)}</div></fieldset><label>Tell us about your experience<textarea name="comment" rows="6" minLength={5} maxLength={3000} placeholder="What made your visit special? What could we improve?" required /></label><small>Your review is shared privately with the hotel team. Please avoid including payment or personal information.</small><button disabled={busy || !rating}>{busy ? 'Sharing…' : 'Share my review →'}</button></form>}</>}</main>;
}
