import { MessagesSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/account') || pathname.startsWith('/staff')) return null;
  return <a href="https://wa.me/254708231994" className="whatsapp-float" aria-label="Chat with Elparaiso on WhatsApp" onClick={() => window.dispatchEvent(new CustomEvent('hotel:analytics', { detail: { event: 'whatsapp-click' } }))}><MessagesSquare size={23} /><span>WhatsApp us</span></a>;
}
