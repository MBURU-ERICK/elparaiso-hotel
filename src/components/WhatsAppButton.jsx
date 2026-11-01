
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phone = "254708231994";

  const message =
    "Hello Elparaiso Hotel, I would like to make an enquiry about your services.";

  const whatsappUrl =
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Elparaiso Hotel on WhatsApp"
    >
      <MessageCircle size={25} />
      <span>Chat with us</span>
    </a>
  );
}
