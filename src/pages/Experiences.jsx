import { Link } from "react-router-dom";
import GalleryPhoto from "../components/GalleryPhoto";
import {
  ArrowRight,
  MessageCircle,
  Trees,
  Baby,
  PartyPopper,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";
import SEO from "../components/SEO";


const activities = [
  {
    title: "The Elparaiso Garden",
    category: "RELAXATION & OUTDOOR EXPERIENCES",
    description:
      "Enjoy the outdoors, relax in a welcoming environment and spend quality time surrounded by the garden atmosphere.",
    icon: <Trees />,
    message:
      "Hello Elparaiso Hotel, I would like to enquire about visiting the garden.",
  },
  {
    title: "Kids' Games",
    category: "FAMILY & CHILDREN",
    description:
      "Bring the family together and let the little ones enjoy the kids' games and family-friendly experiences at Elparaiso.",
    icon: <Baby />,
    message:
      "Hello Elparaiso Hotel, I would like to enquire about your kids' games and family activities.",
  },
  {
    title: "Outdoor Moments",
    category: "FRIENDS & SOCIAL EXPERIENCES",
    description:
      "Create memorable moments with friends and loved ones in a welcoming outdoor setting.",
    icon: <Users />,
    message:
      "Hello Elparaiso Hotel, I would like to enquire about your outdoor spaces.",
  },
  {
    title: "Special Celebrations",
    category: "EVENTS & GATHERINGS",
    description:
      "Planning a special occasion? Speak to our team about your event requirements and available arrangements.",
    icon: <PartyPopper />,
    message:
      "Hello Elparaiso Hotel, I would like to enquire about hosting a celebration or event.",
  },
];

function EnquiryButton({ children = "Make an Enquiry" }) {
  return (
    <Link
      to="/booking?service=conference?service=general"
      className="btn btn-gold"
    >
      <MessageCircle size={17} />
      {children}
    </Link>
  );
}

export default function Experiences() {
  return (
    <>
              <SEO
          title="Garden & Family Experiences"
          description="Explore garden experiences, kids' activities and relaxing spaces at Elparaiso Hotel."
          path="/experiences"
        />
      <section className="experiences-hero">
        <div className="experiences-overlay" />

        <div className="experiences-hero-content">
          <span className="eyebrow">
            DISCOVER ELPARAISO
          </span>

          <h1>
            Moments Worth
            <br />
            <em>Remembering.</em>
          </h1>

          <p>
            From relaxing garden experiences to family
            moments and special celebrations, discover
            more ways to enjoy Elparaiso.
          </p>

          <a href="#activities" className="btn btn-gold">
            Discover Experiences
            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="experiences-intro section">
        <span className="eyebrow">
          MORE THAN A DESTINATION
        </span>

        <h2>
          Something for
          <br />
          <em>Everyone.</em>
        </h2>

        <p>
          Elparaiso Hotel brings together hospitality,
          relaxation, family enjoyment and social
          experiences in Rumuruti, Laikipia.
          Whether you are visiting with family,
          friends or colleagues, there is more to discover.
        </p>
      </section>

      <section className="activities-section" id="activities">
        <div className="section-heading">
          <span className="eyebrow">
            EXPLORE OUR EXPERIENCES
          </span>

          <h2>Discover What Awaits You</h2>

          <p>
            Enjoy the different experiences available
            at Elparaiso Hotel.
          </p>
        </div>

        <div className="activities-grid">
          {activities.map((activity, index) => (
            <article className="activity-card" key={activity.title}>
              <div className="activity-image">
                <GalleryPhoto category="experiences" />

                <span className="activity-number">
                  0{index + 1}
                </span>
              </div>

              <div className="activity-content">
                <div className="activity-icon">
                  {activity.icon}
                </div>

                <span className="eyebrow">
                  {activity.category}
                </span>

                <h3>{activity.title}</h3>

                <p>{activity.description}</p>

                <EnquiryButton message={activity.message}>
                  Enquire Now
                </EnquiryButton>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="garden-highlight">
        <div className="garden-highlight-image">
          <GalleryPhoto category="garden" />
        </div>

        <div className="garden-highlight-content">
          <span className="eyebrow">
            YOUR TIME AT ELPARAISO
          </span>

          <h2>
            Make Every Visit
            <br />
            <em>Special.</em>
          </h2>

          <p>
            Whether you are planning a family outing,
            a relaxing afternoon or a special gathering,
            our team is ready to assist with your enquiry.
          </p>

          <EnquiryButton
            message="Hello Elparaiso Hotel, I would like to know more about your garden and family experiences."
          >
            Plan Your Visit
          </EnquiryButton>
        </div>
      </section>

      <section className="experiences-contact">
        <Sparkles size={30} />

        <span className="eyebrow">
          EXPERIENCE ELPARAISO
        </span>

        <h2>
          Good Times Begin
          <br />
          at Elparaiso.
        </h2>

        <p>
          Find us in Rumuruti, Laikipia County, Kenya.
          Contact our team to plan your visit.
        </p>

        <EnquiryButton
          message="Hello Elparaiso Hotel, I would like to plan a visit. Please share more information."
        >
          Chat With Our Team
        </EnquiryButton>

        <div className="experiences-location">
          <MapPin size={18} />
          Rumuruti, Laikipia County, Kenya
        </div>
      </section>
    </>
  );
}