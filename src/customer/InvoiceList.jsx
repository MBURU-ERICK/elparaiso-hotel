import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortalResource } from './usePortalResource';
import { PortalState, PortalPages, Badge } from './PortalParts';
export default function InvoiceList({ staff = false, onSelect }) {
  const [page, setPage] = useState(1); const { data, ...state } = usePortalResource('invoices', page, staff);
  return <><header className="portal-heading"><p className="eyebrow">CLEAR DETAILS. EASY REVIEW.</p><h1>Invoices</h1><p>Open an invoice to review its details and download a copy for your records.</p></header><PortalState {...state} empty={data && !data.count} />{data?.results.map(item => <article className="portal-request-card" key={item.id}><div><Badge>{item.voided_at ? 'void' : item.review?.decision || 'awaiting review'}</Badge><h2>{staff ? <button className="portal-text-button" onClick={() => onSelect(item.id)}>{item.subject}</button> : <Link to={`/account/invoices/${item.id}`}>{item.subject}</Link>}</h2><p>{item.bill_to} · Due {item.due_date}</p><small>{item.reference}</small></div><strong>KES {Number(item.total).toLocaleString('en-KE')}</strong></article>)}{data && <PortalPages page={page} count={data.count} setPage={setPage} />}</>;
}
