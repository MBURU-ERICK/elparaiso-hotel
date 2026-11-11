import { useEffect, useState } from 'react';
import { customerRequest } from '../customer/customerApi';

export default function StaffGuestInvoices({ onOpenBooking }) {
  const [rows, setRows] = useState(null), [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    customerRequest('/api/customers/staff/guest-reservations/invoice-history/').then(data => { if (active) setRows(data.results); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  return <section className="workspace-panel"><h2>Website booking invoices</h2>{error && <p role="alert">{error}</p>}{!rows && !error && <p role="status">Loading invoices…</p>}{rows?.length === 0 && <p>No invoices have been issued for your facilities.</p>}{rows?.map(invoice => <article className="invoice-history-row" key={invoice.reference}><h3>{invoice.guest}</h3><p>{invoice.booking_code} · {invoice.service}</p><p>Invoice: {invoice.reference}</p><p>KES {Number(invoice.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })} · {invoice.status} · due {invoice.due_date}</p><button onClick={() => onOpenBooking(invoice.request_id)}>Open booking & invoice details →</button></article>)}</section>;
}
