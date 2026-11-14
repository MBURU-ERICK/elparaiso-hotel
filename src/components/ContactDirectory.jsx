import { customerRequest } from '../customer/customerApi';
import { useHomeResource } from '../hooks/useHomeResource';
const load = () => customerRequest('/api/content/');
export default function ContactDirectory() {
  const { data, error, retry } = useHomeResource('contact-directory', load);
  return <section className="premium-section"><h2>The people here to help.</h2>{error && <p>Our directory is temporarily unavailable. Please use our Director or Office contacts above. <button type="button" onClick={retry}>Retry</button></p>}<div className="premium-grid">{data?.contacts?.map(contact => <article className="premium-card" key={contact.id}><div className="premium-card-copy"><h3>{contact.name}</h3><strong>{contact.title}</strong><p>{contact.department}</p>{contact.phone && <p><a href={`tel:${contact.phone}`}>{contact.phone}</a></p>}{contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}</div></article>)}</div></section>;
}
