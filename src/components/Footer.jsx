import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-name">ELPARAISO</span>
            <span className="brand-subtitle">HOTEL & HOSPITALITY</span>
          </Link>

          <p>
            Exceptional hospitality, comfortable
            accommodation and memorable experiences
            in Rumuruti, Laikipia.
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <Link to="/rooms">Accommodation</Link>
          <Link to="/restaurant">Restaurant</Link>
          <Link to="/experiences">Experiences</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div>
          <h3>Get In Touch</h3>

          <p>
            <MapPin size={16} />
            Rumuruti, Laikipia, Kenya
          </p>

          <p>
            <Phone size={16} />
            <a href="tel:+254708231994">+254 708 231 994</a>
          </p>

          <p>
            <Mail size={16} />
            <a href="mailto:elparaisohotelltd@gmail.com">
              elparaisohotelltd@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Elparaiso Hotel.
          All rights reserved.
        </span>
        <span>Designed for memorable experiences.</span>
      </div>
    </footer>
  );
}