import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerRequest } from '../customer/customerApi';
export default function ConferencePackages() {
  const [packages, setPackages] = useState([]); const [error, setError] = useState('');
  useEffect(() => { customerRequest('/api/customers/conference-packages/').then(d => setPackages(d.packages)).catch(() => setError('Contact our team for the latest conference packages.')); }, []);
  return <section className="section"><span className="eyebrow">GATHER WELL</span><h2>Half a day or the whole occasion.</h2>{error && <p>{error}</p>}<div className="package-grid">{packages.map(p => <article className="portal-panel" key={p.id}>{p.image_url && <img src={p.image_url} alt={`${p.facility_name} conference space`} loading="lazy" style={{ width: '100%', height: 220, objectFit: 'cover' }} />}<small>{p.facility_name}</small><h3>{p.duration === 'half' ? 'Half day' : 'Full day'} conference</h3><p><strong>KES {Number(p.price_per_guest).toLocaleString()}</strong> / guest</p><p style={{ whiteSpace: 'pre-line' }}>{p.offerings}</p><Link className="portal-button" to={`/booking?service=conference&facility=${p.facility}&package=${p.id}`}>Enquire about this package →</Link></article>)}</div></section>;
}
