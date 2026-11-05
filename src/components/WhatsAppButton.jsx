import { MessagesSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/account') || pathname.startsWith('/staff')) return null;
  return <Link to="/account/requests/new" className="whatsapp-float" aria-label="Request a quotation in your customer portal"><MessagesSquare size={23} /><span>Plan your visit</span></Link>;
}
