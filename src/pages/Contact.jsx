import SEO from "../components/SEO";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";

const WHATSAPP_NUMBER = "254708231994";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "General Enquiry",
    date: "",
    message: "",
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = `
Hello Elparaiso Hotel,

I would like to make an enquiry.

Name: ${form.name}
Phone: ${form.phone}
Enquiry: ${form.service}
Preferred Date: ${form.date || "Not specified"}

Message:
${form.message || "I would like more information."}

Thank you.
    `.trim();

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main>
        <SEO
    title="Contact & Reservations"
    description="Contact Elparaiso Hotel in Rumuruti for accommodation, dining and reservation enquiries."
    path="/contact"
  />
      <section className="contact-hero">
        <div className="contact-overlay" />
        <div className="contact-hero-content">
          <span className="eyebrow">WE WOULD LOVE TO HEAR FROM YOU</span>
          <h1>Let's Make Your Visit Special</h1>
          <p>
            Contact us for accommodation, dining, reservations
            and other enquiries.
          </p>
        </div>
      </section>

      <section className="contact-section section">
        <div className="contact-info">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2>We're Here to Help</h2>
          <p>
            Have a question or planning a visit? Reach out to our team.
            We look forward to welcoming you.
          </p>

          <div className="contact-detail">
            <div className="contact-detail-icon"><MapPin /></div>
            <div>
              <h3>Our Location</h3>
              <p>Rumuruti, Laikipia County, Kenya</p>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-detail-icon"><Phone /></div>
            <div>
              <h3>Call Us</h3>
              <a href="tel:+254708231994">0708 231 994</a>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-detail-icon"><Mail /></div>
            <div>
              <h3>Email Us</h3>
              <a href="mailto:elparaisohotelltd@gmail.com">
                elparaisohotelltd@gmail.com
              </a>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-detail-icon"><Clock /></div>
            <div>
              <h3>Enquiries</h3>
              <p>Contact us for current availability and service hours.</p>
            </div>
          </div>

          <a
            className="btn btn-gold"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>

        <div className="contact-form-wrapper">
          <span className="eyebrow">SEND AN ENQUIRY</span>
          <h2>How Can We Help You?</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Your Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <label htmlFor="service">What are you enquiring about?</label>
            <select
              id="service"
              name="service"
              value={form.service}
              onChange={handleChange}
            >
              <option>General Enquiry</option>
              <option>Accommodation</option>
              <option>Restaurant & Dining</option>
              <option>Garden Experience</option>
              <option>Kids Activities</option>
              <option>Airbnb</option>
              <option>Events & Groups</option>
            </select>

            <label htmlFor="date">Preferred Visit Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />

            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Tell us how we can help..."
              value={form.message}
              onChange={handleChange}
            />

            <button type="submit" className="btn btn-gold contact-submit">
              <Send size={17} />
              Send via WhatsApp
            </button>

            <p className="contact-form-note">
              Your enquiry will open in WhatsApp for you to review and send.
            </p>
          </form>
        </div>
      </section>

      <section className="contact-map">
        <iframe
          title="Elparaiso Hotel location in Rumuruti"
          src="https://www.google.com/maps?q=Rumuruti,Laikipia,Kenya&output=embed"
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </main>
  );
}
