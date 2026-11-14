import { hotelContacts } from '../data/contacts';
import './contact-links.css';
export default function ContactLinks({ whatsapp = false }) {
  return <span className="hotel-contact-links">{hotelContacts.map(contact => <a key={contact.label} href={whatsapp ? `https://wa.me/${contact.international.slice(1)}?text=${encodeURIComponent("Hello Elparaiso Hotel, I would like to plan a visit.")}` : `tel:${contact.international}`} onClick={() => window.dispatchEvent(new CustomEvent('hotel:analytics', { detail: { event: whatsapp ? 'whatsapp-click' : 'call-click', contact: contact.label } }))}>{whatsapp ? 'WhatsApp ' : ''}{contact.label}: {contact.display}</a>)}</span>;
}
