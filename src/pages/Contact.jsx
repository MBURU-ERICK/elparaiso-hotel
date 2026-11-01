import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Clock,
} from "lucide-react";

const PHONE = "+254708231994";
const EMAIL = "elparaisohotelltd@gmail.com";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "General Enquiry",
    message: "",
  });

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitEnquiry = (event) => {
    event.preventDefault();

    const message = `
Hello Elparaiso Hotel,

My name is ${form.name}.
My phone number is ${form.phone}.

Enquiry: ${form.subject}

Message:
${form.message}

I look forward to hearing from you.
    `.trim();

    window.open(
      `https://wa.me/254708231994?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <section className="contact-hero">
        <div className="contact-overlay" />

        <div className="contact-hero-content">
          <span className="eyebrow">WE ARE HERE FOR YOU</span>

          <h1>
            Let's Start a
            <br />
            <em>Conversation.</em>
          </h1>

          <p>
            Have a question about accommodation, dining,
            garden experiences or reservations?
            Our team is ready to assist.
          </p>
        </div>
      </section>

      <section className="contact-section section">
        <div className="contact-info">
          <span className="eyebrow">GET IN TOUCH</span>

          <h2>
            We'd Love to
            <br />
            Hear From You.
          </h2>

          <p>
            Reach out to Elparaiso Hotel for enquiries,
            reservations and information about our facilities.
          </p>

          <div className="contact-detail">
            <div className="contact-detail-icon">
              <Phone />
            </div>

            <div>
              <span>CALL US</span>
              <a href={`tel:${PHONE}`}>{PHONE}</a>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-detail-icon">
              <Mail />
            </div>

            <div>
              <span>EMAIL US</span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-detail-icon">
              <MapPin />
            </div>

            <div>
              <span>VISIT US</span>
              <strong>Rumuruti, Laikipia County, Kenya</strong>
            </div>
          </div>

          <div className="contact-detail">
            <div className="contact-detail-icon">
              <Clock />
            </div>

            <div>
              <span>ENQUIRIES</span>
              <strong>Contact our team for assistance</strong>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <span className="eyebrow">SEND AN ENQUIRY</span>

          <h3>How Can We Help You?</h3>

          <form onSubmit={submitEnquiry} className="contact-form">
            <label htmlFor="contact-name">Your Name</label>

            <input
              id="contact-name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Enter your name"
              required
            />

            <label htmlFor="contact-phone">Phone Number</label>

            <input
              id="contact-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              placeholder="Enter your phone number"
              required
            />

            <label htmlFor="contact-subject">Enquiry Type</label>

            <select
              id="contact-subject"
              name="subject"
              value={form.subject}
              onChange={updateField}
            >
              <option>General Enquiry</option>
              <option>Hotel Accommodation</option>
              <option>Airbnb Accommodation</option>
              <option>Restaurant & Dining</option>
              <option>Drinks</option>
              <option>Garden & Kids' Games</option>
              <option>Events & Celebrations</option>
              <option>Reservations</option>
            </select>

            <label htmlFor="contact-message">Your Message</label>

            <textarea
              id="contact-message"
              name="message"
              rows="5"
              value={form.message}
              onChange={updateField}
              placeholder="How can we assist you?"
              required
            />

            <button type="submit" className="btn btn-gold contact-submit">
              <Send size={17} />
              Send via WhatsApp
            </button>

            <p className="contact-form-note">
              Your enquiry will be prepared in WhatsApp.
              You will need to press Send there to submit it.
            </p>
          </form>
        </div>
      </section>

      <section className="contact-map">
        <div>
          <MapPin size={30} />

          <span className="eyebrow">OUR LOCATION</span>

          <h2>Find Elparaiso Hotel</h2>

          <p>Rumuruti, Laikipia County, Kenya</p>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Elparaiso+Hotel+Rumuruti+Laikipia+Kenya"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold"
          >
            Open Google Maps
          </a>
        </div>
      </section>
    </>
  );
}