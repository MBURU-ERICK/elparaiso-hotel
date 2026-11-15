import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { customerRequest } from '../customer/customerApi';

export default function ReviewPublicationButton({ review, kind, onUpdate }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function toggle() {
    setBusy(true); setError('');
    try {
      const updated = await customerRequest(`/api/customers/staff/${kind}/${review.id}/publication/`, {
        method: 'POST', body: JSON.stringify({ is_published: !review.is_published }),
      });
      onUpdate(updated);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="review-publication"><p role="status">{review.is_published ? 'Published on the Experience page' : 'Private feedback · unpublished'}</p><button type="button" disabled={busy} onClick={toggle}>{review.is_published ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{busy ? 'Saving…' : review.is_published ? 'Unpublish review' : 'Publish to guest website'}</button>{error && <p role="alert">{error}</p>}</div>;
}
