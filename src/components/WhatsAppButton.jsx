import { MessagesSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ContactLinks from './ContactLinks';
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/account') || pathname.startsWith('/staff')) return null;
  return <details className="whatsapp-float hotel-whatsapp-picker"><summary aria-label="Choose Director or Office on WhatsApp"><MessagesSquare size={23} /><span>WhatsApp us</span></summary><ContactLinks whatsapp /></details>;
}
