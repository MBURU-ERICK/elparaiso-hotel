import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortalResource } from './usePortalResource';
import { customerApi } from './customerApi';
import { PortalState, Badge } from './PortalParts';
export default function InvoiceDetail({ staff = false, invoiceId }) {
  const params = useParams(); const id = invoiceId || params.id;
  const { data: item, ...state } = usePortalResource('invoices', 1, staff, id);
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [confirmVoid, setConfirmVoid] = useState(false);
  async function download() { setBusy(true); setError(''); try { await customerApi.download(id, item.reference, staff); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  async function review(event) { event.preventDefault(); setBusy(true); setError(''); try { const result = await customerApi.review(id, Object.fromEntries(new FormData(event.currentTarget))); setMessage(result.detail); state.retry(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  async function voidInvoice() { setBusy(true); setError(''); try { await customerApi.void(id); setConfirmVoid(false); state.retry(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  if (!item) return <PortalState {...state} />;
  return <><header className="portal-heading"><p className="eyebrow">YOUR DOCUMENTS</p><h1>Invoice review</h1><p>Check the service, quantities, rates and billing details.</p></header>{error && <p role="alert" className="portal-alert">{error}</p>}{message && <p role="status" className="portal-notice">{message}</p>}
    <article className="invoice-paper"><header><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel" width="220" height="90" /><div><h2>Invoice</h2><Badge>{item.voided_at ? 'void' : 'issued'}</Badge><p className="invoice-reference">{item.reference}</p></div></header><div className="portal-detail-grid"><div><p className="eyebrow">BILL TO</p><h3>{item.bill_to}</h3><p>{item.customer_email}</p></div><div><p>Issued {new Date(item.issued_at).toLocaleDateString()}</p><p>Due {item.due_date}</p><p>{item.facility_name}</p></div></div><h3>{item.subject}</h3>
      <div className="staff-table-scroll"><table><thead><tr><th>Description</th><th>Quantity</th><th>Unit price</th><th>Amount (KES)</th></tr></thead><tbody>{item.line_items.map((line, index) => <tr key={index}><td>{line.description}</td><td>{line.quantity}</td><td>{line.unit_price}</td><td>{line.amount}</td></tr>)}</tbody></table></div>
      <p className="invoice-total">Total KES {Number(item.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</p><p className="preserve-lines">{item.notes}</p><footer>Elparaiso Hotel · Rumuruti, Laikipia · +254 708 231 994<br />An invoice is not a payment receipt. Your review confirms details only.</footer>
    </article><div className="portal-toolbar"><button className="portal-button" disabled={busy} onClick={download}>Download invoice ↓</button><p className="portal-help">Portable HTML with the hotel logo. Open the download and use Print → Save as PDF for a PDF copy.</p></div>
    {item.review && <section className="portal-panel"><h2>Customer review</h2><Badge>{item.review.decision}</Badge><p>{item.review.notes}</p><small>{new Date(item.review.created_at).toLocaleString()}</small></section>}
    {!staff && !item.voided_at && !item.review && <form className="portal-form portal-panel" onSubmit={review}><h2>Are the details correct?</h2><label>Your review<select name="decision"><option value="acknowledged">The invoice details are correct</option><option value="disputed">I need a correction</option></select></label><label>Notes / discrepancy<textarea name="notes" maxLength={3000} rows="4" /></label><p className="portal-help">A review is recorded once. For further changes, message the team through the original request.</p><button disabled={busy} className="portal-button">Submit review</button></form>}
    {staff && !item.voided_at && <section className="portal-panel"><button onClick={() => setConfirmVoid(true)}>Void this invoice</button>{confirmVoid && <div role="alertdialog" aria-labelledby="void-invoice-title"><h2 id="void-invoice-title">Void this invoice?</h2><p>The document remains in the audit history and the customer will be notified.</p><button disabled={busy} onClick={voidInvoice}>Confirm void</button><button onClick={() => setConfirmVoid(false)}>Cancel</button></div>}</section>}
  </>;
}
