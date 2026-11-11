import { MessagesSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/account') || pathname.startsWith('/staff')) return null;
  return <Link to="/booking" className="whatsapp-float" aria-label="Request a booking or quotation"><MessagesSquare size={23} /><span>Plan your visit</span></Link>;
}
