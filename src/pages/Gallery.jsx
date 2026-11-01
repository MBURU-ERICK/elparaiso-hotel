
import { useState } from "react";
import { Link } from "react-router-dom";

const photos = [
  {
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    title: "Restaurant",
    category: "Dining",
  },
  {
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    title: "Comfortable Accommodation",
    category: "Accommodation",
  },
  {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    title: "Dining Experience",
    category: "Dining",
  },
  {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    title: "Garden",
    category: "Garden",
  },
  {
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    title: "Relaxing Stay",
    category: "Accommodation",
  },
  {
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
    title: "Outdoor Moments",
    category: "Garden",
  },
];

const categories = ["All", "Dining", "Accommodation", "Garden"];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  return (
    <main>
      <section className="gallery-hero">
        <div className="gallery-overlay" />
        <div className="gallery-hero-content">
          <span className="eyebrow">A GLIMPSE OF ELPARAISO</span>
          <h1>Moments Worth Remembering</h1>
          <p>Explore the spaces and experiences waiting for you.</p>
        </div>
      </section>

      <section className="gallery-section section">
        <div className="section-heading">
          <span className="eyebrow">OUR GALLERY</span>
          <h2>Explore Elparaiso</h2>
          <p>A look at our dining, accommodation and outdoor spaces.</p>
        </div>

        <div className="gallery-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`gallery-filter ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="gallery-grid">
          {filteredPhotos.map((photo, index) => (
            <article className="gallery-item" key={photo.title}>
              <img
                src={`${photo.image}?auto=format&fit=crop&w=1000&q=85`}
                alt={photo.title}
                loading="lazy"
              />
              <div className="gallery-item-overlay">
                <span>{photo.category}</span>
                <h3>{photo.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-cta">
        <span className="eyebrow">COME AND SEE FOR YOURSELF</span>
        <h2>Your Elparaiso Experience Awaits</h2>
        <Link to="/contact" className="btn btn-gold">
          Make an Enquiry
        </Link>
      </section>
    </main>
  );
}
