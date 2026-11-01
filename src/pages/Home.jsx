import { Link } from "react-router-dom";
import {
  ArrowRight,
  Utensils,
  BedDouble,
  CalendarDays,
  Sparkles,
} from "lucide-react";

const experiences = [
  {
    icon: <BedDouble />,
    title: "Comfortable Accommodation",
    description:
      "Relax in thoughtfully designed spaces created for comfort and memorable stays.",
  },
  {
    icon: <Utensils />,
    title: "Exceptional Dining",
    description:
      "Discover delightful dining experiences and hospitality at our restaurant.",
  },
  {
    icon: <CalendarDays />,
    title: "Events & Celebrations",
    description:
      "Make your special occasions memorable with our hospitality and event services.",
  },
  {
    icon: <Sparkles />,
    title: "Warm Hospitality",
    description:
      "Experience attentive service and an atmosphere designed around our guests.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="eyebrow">
            WELCOME TO ELPARAISO HOTEL
          </span>

          <h1>
            An Experience
            <br />
            Beyond <em>Ordinary.</em>
          </h1>

          <p>
            Discover comfort, exceptional hospitality and
            memorable experiences in a place designed for you.
          </p>

          <div className="hero-actions">
            <Link to="/rooms" className="btn btn-gold">
              Explore Accommodation <ArrowRight size={17} />
            </Link>

            <Link to="/contact" className="btn btn-outline">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="hero-bottom">
          <span>COMFORT · DINING · HOSPITALITY</span>
          <span>YOUR EXPERIENCE BEGINS HERE</span>
        </div>
      </section>

      <section className="intro section">
        <div className="intro-image">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000"
            alt="Beautiful hotel swimming pool and surroundings"
          />
        </div>

        <div className="intro-content">
          <span className="eyebrow">THE ELPARAISO EXPERIENCE</span>

          <h2>
            More Than a Stay.
            <br />
            A Feeling of <em>Belonging.</em>
          </h2>

          <p>
            At Elparaiso Hotel, we believe hospitality is
            about more than providing a place to stay.
            It is about creating an atmosphere where
            every guest feels welcome, valued and comfortable.
          </p>

          <Link to="/about" className="text-link">
            Discover Our Story <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="experiences section">
        <div className="section-heading">
          <span className="eyebrow">DISCOVER ELPARAISO</span>
          <h2>Experiences Designed Around You</h2>
          <p>
            Every detail contributes to a memorable hospitality experience.
          </p>
        </div>

        <div className="experience-grid">
          {experiences.map((item) => (
            <article className="experience-card" key={item.title}>
              <div className="experience-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <ArrowRight size={18} className="card-arrow" />
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span className="eyebrow">YOUR NEXT EXPERIENCE AWAITS</span>
          <h2>We Look Forward to Welcoming You.</h2>
          <p>
            Get in touch with our team and let us help
            you plan your next visit.
          </p>
          <Link to="/contact" className="btn btn-gold">
            Get In Touch <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}