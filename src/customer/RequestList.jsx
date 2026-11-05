import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortalResource } from './usePortalResource';
import { PortalState, PortalPages, Badge } from './PortalParts';
export default function RequestList({ staff = false, onSelect }) {
  const [page, setPage] = useState(1); const { data, ...state } = usePortalResource('requests', page, staff);
  return <><header className="portal-heading"><p className="eyebrow">EVERY DETAIL, IN ONE PLACE</p><h1>{staff ? 'Customer requests' : 'Requests & quotations'}</h1><p>{staff ? 'Review requirements, reply to customers and prepare quotations.' : 'Follow your requests and keep the conversation with our team here.'}</p>{!staff && <Link to="/account/requests/new" className="portal-button">New quotation request +</Link>}</header>
    <PortalState {...state} empty={data && !data.results.length} /><div className="portal-request-list">{data?.results.map(item => <article className="portal-request-card" key={item.id}><div><Badge>{item.status}</Badge><h2>{staff ? <button className="portal-text-button" onClick={() => onSelect(item.id)}>{item.subject}</button> : <Link to={`/account/requests/${item.id}`}>{item.subject}</Link>}</h2><p>{item.facility_name} · {item.guests} guests · {item.rooms} rooms</p><p>{item.start_date} → {item.end_date}</p><small>{item.company || 'Personal request'} · {item.service.replaceAll('_', ' ')}</small></div>{item.quotation_amount && <strong>KES {Number(item.quotation_amount).toLocaleString('en-KE')}<small>Quotation</small></strong>}</article>)}</div>{data && <PortalPages page={page} count={data.count} setPage={setPage} />}</>;
}
