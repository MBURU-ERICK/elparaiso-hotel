import { Link } from "react-router-dom";
import GalleryPhoto from "../components/GalleryPhoto";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  MapPin,
  MessageCircle,
  Home,
  Sparkles,
} from "lucide-react";
import SEO from "../components/SEO";

const accommodation = [
  {
    id: 1,
    name: "Hotel Accommodation",
    subtitle: "Comfort & Hospitality",
    description:
      "Enjoy a welcoming hotel experience at Elparaiso. Contact our team to enquire about available rooms, rates and your preferred dates.",
    icon: <BedDouble size={23} />,
    features: ["Comfortable stays", "Personalised assistance", "Direct reservations"],
  },
  {
    id: 2,
    name: "Airbnb Accommodation",
    subtitle: "Your Space Away From Home",
    description:
      "Discover our Airbnb accommodation options for guests looking for a comfortable and convenient stay in Rumuruti.",
    icon: <Home size={23} />,
    features: ["Private accommodation", "Flexible enquiries", "Comfortable living"],
  },
];

export default function Rooms() {
  return (
    <>
      <SEO
    title="Rooms & Accommodation"
    description="Enquire about accommodation and Airbnb stays at Elparaiso Hotel in Rumuruti, Laikipia County."
    path="/rooms"
  />
      <section className="rooms-hero">
        <div className="rooms-hero-overlay" />

        <div className="rooms-hero-content">
          <span className="eyebrow">STAY WITH ELPARAISO</span>

          <h1>
            Your Comfort.
            <br />
            Our <em>Priority.</em>
          </h1>

          <p>
            Discover welcoming accommodation and a relaxing
            hospitality experience in Rumuruti, Laikipia.
          </p>

          <a href="#accommodation" className="btn btn-gold">
            Explore Accommodation <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="rooms-intro section">
        <span className="eyebrow">ACCOMMODATION AT ELPARAISO</span>

        <h2>
          Find Your Perfect
          <br />
          <em>Place to Stay.</em>
        </h2>

        <p>
          Whether you are visiting for a short getaway, a
          business trip or a relaxing holiday, Elparaiso
          offers accommodation options designed to make
          your stay enjoyable.
        </p>
      </section>

      <section id="accommodation" className="accommodation-section">
        {accommodation.map((item, index) => (
          <article className="accommodation-card" key={item.id}>
            <div
              className={`accommodation-image ${
                index % 2 !== 0 ? "image-right" : ""
              }`}
            >
              <GalleryPhoto category={item.id === 2 ? "airbnb" : "rooms"} />
              <span className="image-number">
                0{item.id}
              </span>
            </div>

            <div className="accommodation-content">
              <div className="accommodation-icon">
                {item.icon}
              </div>

              <span className="eyebrow">{item.subtitle}</span>

              <h2>{item.name}</h2>

              <p>{item.description}</p>

              <ul className="accommodation-features">
                {item.features.map((feature) => (
                  <li key={feature}>
                    <Sparkles size={15} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={item.id === 2 ? "/airbnb" : "/booking"}
                className="btn btn-gold"
              >
                <MessageCircle size={17} />
                Book your stay
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="stay-cta">
        <div className="stay-cta-content">
          <span className="eyebrow">LET US WELCOME YOU</span>

          <h2>
            Your Next Stay
            <br />
            Starts Here.
          </h2>

          <p>
            Speak to our team about availability,
            accommodation options and reservations.
          </p>

          <Link
            to="/account/requests/new"
            className="btn btn-gold"
          >
            <MessageCircle size={17} />
            Request a quotation
          </Link>
        </div>

        <div className="stay-contact">
          <div>
            <MapPin />
            <span>Rumuruti, Laikipia County, Kenya</span>
          </div>

          <div>
            <CalendarDays />
            <span>Contact us for availability</span>
          </div>
        </div>
      </section>
    </>
  );
}