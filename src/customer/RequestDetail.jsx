import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortalResource } from './usePortalResource';
import { customerApi } from './customerApi';
import { PortalState, PortalPages, Badge } from './PortalParts';
export default function RequestDetail({ staff = false, requestId }) {
  const params = useParams(); const id = requestId || params.id;
  const { data: item, ...state } = usePortalResource('requests', 1, staff, id);
  const [messages, setMessages] = useState(null); const [page, setPage] = useState(1); const [revision, setRevision] = useState(0);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const threadKey = `${id}:${page}:${staff}:${revision}`;
  const thread = messages?._key === threadKey ? messages : null;
  useEffect(() => { let active = true; customerApi.messages(id, page, staff).then(data => { if (active) setMessages({ ...data, _key: threadKey }); }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, [id, page, staff, revision, threadKey]);
  async function reply(event) { event.preventDefault(); const form = event.currentTarget; setBusy(true); setError(''); try { await customerApi.reply(id, new FormData(form).get('body'), staff); form.reset(); setRevision(n => n + 1); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  if (!item) return <PortalState {...state} />;
  return <><header className="portal-heading"><Badge>{item.status}</Badge><h1>{item.subject}</h1><p>{item.facility_name} · {item.start_date} → {item.end_date}</p><small>Reference {item.reference}</small></header>
    <div className="portal-detail-grid"><section className="portal-panel"><h2>Your brief</h2>{item.contact && <p>{item.contact.name}<br />{item.contact.email}<br />{item.contact.phone}<br />KRA PIN: {item.contact.kra_pin || 'Not provided'}</p>}<dl><dt>Organisation</dt><dd>{item.company || 'Personal request'}</dd><dt>Service</dt><dd>{item.service}</dd><dt>Guests / rooms</dt><dd>{item.guests} guests / {item.rooms} rooms</dd></dl>{item.selection?.lines?.length > 0 && <section><h3>Selected rooms and packages</h3>{item.selection.lines.map((line, index) => <p key={index}>{line.description}: {line.quantity} × KSh {Number(line.unit_price).toLocaleString()} × {line.periods} {line.room_type ? 'nights' : 'session'} = KSh {Number(line.amount).toLocaleString()}<br />{line.offerings}</p>)}<strong>Estimate: KSh {Number(item.selection.total).toLocaleString()}</strong><p>{item.selection.note}</p></section>}<p className="preserve-lines">{item.requirements}</p></section>
    <section className="portal-panel quotation-panel"><p className="eyebrow">YOUR TAILORED QUOTATION</p><h2>{item.quotation_amount ? `KES ${Number(item.quotation_amount).toLocaleString('en-KE')}` : 'Our team is reviewing your brief.'}</h2><p className="preserve-lines">{item.quotation_notes || 'We will notify you by email when there is an update.'}</p><small>Subject to the stated scope, availability and confirmation.</small></section></div>
    <section className="portal-panel"><h2>Conversation with Elparaiso</h2>{error && <div role="alert" className="portal-alert"><p>{error}</p><button onClick={() => { setError(''); setRevision(n => n + 1); }}>Try again</button></div>}{!thread && !error && <p role="status">Loading messages…</p>}
      <div className="portal-conversation">{thread?.results.slice().reverse().map(message => <article className={`portal-message ${message.from_staff ? 'from-team' : ''}`} key={message.id}><strong>{message.from_staff ? 'Elparaiso team' : 'Customer'}</strong><time>{new Date(message.created_at).toLocaleString()}</time><p className="preserve-lines">{message.body}</p></article>)}</div>
      {thread && !thread.count && <p>Your conversation will appear here. Send a message if you have any further details.</p>}{thread && <PortalPages page={page} count={thread.count} setPage={setPage} />}
      <form className="portal-form" onSubmit={reply}><label>Your message<textarea name="body" rows="4" maxLength={3000} required /></label><button className="portal-button" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button></form>
    </section></>;
}
