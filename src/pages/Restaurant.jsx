import { Link } from "react-router-dom";
import GalleryPhoto from "../components/GalleryPhoto";
import { MessageCircle, ArrowRight, Utensils, Coffee, Wine, Clock } from "lucide-react";
import SEO from "../components/SEO";


const enquiries = {
  food: "Hello Elparaiso Hotel, I would like to enquire about your restaurant menu and meals.",
  drinks: "Hello Elparaiso Hotel, I would like to enquire about your available drinks.",
  order: "Hello Elparaiso Hotel, I would like to make a restaurant order. Please assist me.",
};

const diningExperiences = [
  {
    icon: <Utensils />,
    title: "Delicious Dining",
    description:
      "Enjoy a welcoming dining experience with meals prepared for guests, families and visitors.",
  },
  {
    icon: <Coffee />,
    title: "Relaxed Moments",
    description:
      "Take a break, meet friends and enjoy the welcoming atmosphere of Elparaiso.",
  },
  {
    icon: <Wine />,
    title: "Drinks & Refreshments",
    description:
      "Explore our drinks and refreshments. Contact our team for the available selection.",
  },
];

function WhatsAppButton({ children }) {
  return (
    <Link
      to="/conference-meals"
      className="btn btn-gold"
    >
      <MessageCircle size={17} />
      {children}
    </Link>
  );
}

export default function Restaurant() {
  return (
    <>
      <SEO
    title="Restaurant & Dining"
    description="Visit Elparaiso Hotel for restaurant dining, drinks and a welcoming atmosphere in Rumuruti."
    path="/restaurant"
  />
      <section className="restaurant-hero">
        <div className="restaurant-overlay" />

        <div className="restaurant-hero-content">
          <span className="eyebrow">ELPARAISO RESTAURANT</span>

          <h1>
            Good Food.
            <br />
            Beautiful <em>Moments.</em>
          </h1>

          <p>
            Discover welcoming dining, refreshing drinks
            and memorable moments at Elparaiso Hotel,
            Rumuruti.
          </p>

          <a href="#dining" className="btn btn-gold">
            Explore Dining <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="restaurant-intro section">
        <span className="eyebrow">A PLACE TO COME TOGETHER</span>

        <h2>
          Every Meal Is an
          <br />
          Opportunity to <em>Connect.</em>
        </h2>

        <p>
          Whether you are enjoying a meal with family,
          meeting friends or taking a relaxing break,
          Elparaiso offers a welcoming restaurant
          experience in the heart of Rumuruti.
        </p>
      </section>

      <section className="dining-section" id="dining">
        <div className="dining-image">
          <GalleryPhoto category="restaurant" />
        </div>

        <div className="dining-content">
          <span className="eyebrow">THE RESTAURANT EXPERIENCE</span>

          <h2>
            Made for Good Food
            <br />
            and Great Company.
          </h2>

          <p>
            Enjoy a relaxed restaurant atmosphere and
            attentive hospitality. Our team is ready to
            help you discover what's available.
          </p>

          <WhatsAppButton message={enquiries.food}>
            Enquire About Our Menu
          </WhatsAppButton>
        </div>
      </section>

      <section className="dining-experiences section">
        <div className="section-heading">
          <span className="eyebrow">MORE THAN JUST DINING</span>
          <h2>Discover Elparaiso</h2>
          <p>
            Good hospitality brings people together.
            Enjoy the different experiences our restaurant offers.
          </p>
        </div>

        <div className="dining-grid">
          {diningExperiences.map((item) => (
            <article className="dining-card" key={item.title}>
              <div className="dining-card-icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="drinks-section">
        <div className="drinks-image">
          <GalleryPhoto category="restaurant" />
        </div>

        <div className="drinks-content">
          <span className="eyebrow">REFRESH AND RELAX</span>

          <h2>
            Drinks & <em>Refreshments.</em>
          </h2>

          <p>
            From relaxing moments to time spent with
            friends, discover the drinks and refreshments
            available at Elparaiso.
          </p>

          <WhatsAppButton message={enquiries.drinks}>
            Enquire About Drinks
          </WhatsAppButton>
        </div>
      </section>

      <section className="restaurant-menu-cta">
        <span className="eyebrow">VISIT ELPARAISO RESTAURANT</span>

        <h2>
          Something Delicious
          <br />
          Is Waiting for You.
        </h2>

        <p>
          Contact our team for the current menu,
          available meals, drinks and restaurant enquiries.
        </p>

        <WhatsAppButton message={enquiries.order}>
          <MessageCircle size={17} />
          Request a dining quotation
        </WhatsAppButton>

        <div className="restaurant-details">
          <div>
            <Utensils />
            <span>Restaurant & Dining</span>
          </div>

          <div>
            <Clock />
            <span>Contact us for service hours</span>
          </div>
        </div>
      </section>
    </>
  );
}