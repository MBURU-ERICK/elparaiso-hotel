
import { Link } from "react-router-dom";
import { MapPin, Utensils, BedDouble, Trees, Heart, Users } from "lucide-react";
import SEO from "../components/SEO";

export default function About() {
  return (
    <main>
        <SEO
    title="About Our Hotel in Rumuruti"
    description="Learn about Elparaiso Hotel, our hospitality, facilities and location in Rumuruti, Laikipia."
    path="/about"
  />
      <section className="about-hero">
        <div className="about-overlay" />
        <div className="about-hero-content">
          <span className="eyebrow">WELCOME TO ELPARAISO</span>
          <h1>A Place to Relax, Connect & Enjoy</h1>
          <p>
            Discover warm hospitality, comfortable accommodation,
            delicious dining and memorable moments in Rumuruti.
          </p>
          <Link to="/contact" className="btn btn-gold">
            Get in Touch
          </Link>
        </div>
      </section>

      <section className="about-story section">
        <div className="about-story-image">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
            alt="Welcoming restaurant atmosphere"
          />
        </div>

        <div className="about-story-content">
          <span className="eyebrow">OUR STORY</span>
          <h2>Hospitality That Feels Like Home</h2>
          <p>
            Elparaiso Hotel is a welcoming destination in Rumuruti,
            Laikipia County, bringing together relaxation, dining
            and experiences for individuals, families and groups.
          </p>
          <p>
            Whether you are visiting for a meal, planning a stay,
            enjoying the garden or spending time with family,
            we look forward to welcoming you.
          </p>
          <Link to="/experiences" className="text-link">
            Explore our experiences →
          </Link>
        </div>
      </section>

      <section className="about-values section">
        <div className="section-heading">
          <span className="eyebrow">WHAT MAKES US SPECIAL</span>
          <h2>More Than Just a Stay</h2>
          <p>Enjoy different experiences in one welcoming destination.</p>
        </div>

        <div className="about-values-grid">
          <article className="about-value-card">
            <div className="about-value-icon"><BedDouble /></div>
            <h3>Comfortable Stays</h3>
            <p>Relax and unwind with our accommodation options.</p>
          </article>

          <article className="about-value-card">
            <div className="about-value-icon"><Utensils /></div>
            <h3>Restaurant & Drinks</h3>
            <p>Enjoy dining and refreshments in a welcoming setting.</p>
          </article>

          <article className="about-value-card">
            <div className="about-value-icon"><Trees /></div>
            <h3>Garden Experiences</h3>
            <p>Take a break and enjoy time in our garden spaces.</p>
          </article>

          <article className="about-value-card">
            <div className="about-value-icon"><Users /></div>
            <h3>Family Moments</h3>
            <p>Make memories with family-friendly activities and kids' games.</p>
          </article>

          <article className="about-value-card">
            <div className="about-value-icon"><Heart /></div>
            <h3>Warm Hospitality</h3>
            <p>We aim to make every visit welcoming and memorable.</p>
          </article>

          <article className="about-value-card">
            <div className="about-value-icon"><MapPin /></div>
            <h3>Convenient Location</h3>
            <p>Find us in Rumuruti, Laikipia County, Kenya.</p>
          </article>
        </div>
      </section>

      <section className="about-location">
        <div className="about-location-content">
          <span className="eyebrow">FIND US</span>
          <h2>Experience Elparaiso in Rumuruti</h2>
          <p>
            Visit us in Rumuruti, Laikipia County, Kenya.
            Contact our team for enquiries and reservations.
          </p>
          <Link to="/contact" className="btn btn-gold">
            Contact Elparaiso
          </Link>
        </div>
      </section>

      <section className="about-final-cta">
        <span className="eyebrow">YOUR NEXT EXPERIENCE STARTS HERE</span>
        <h2>We Look Forward to Welcoming You</h2>
        <Link to="/contact" className="btn btn-gold">
          Make an Enquiry
        </Link>
      </section>
    </main>
  );
}
