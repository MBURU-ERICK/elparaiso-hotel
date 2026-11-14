
import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";

const links = [
  { name: 'Home', path: '/' }, { name: 'Accommodation', path: '/rooms' },
  { name: 'Restaurant', path: '/restaurant' }, { name: 'Private Stays', path: '/private-stays' },
  { name: 'Experiences', path: '/experiences' }, { name: 'Events & Groups', path: '/events-groups' },
  { name: 'Conferences', path: '/conferences' }, { name: 'About Us', path: '/about' }, { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="navbar">
      <Link
        to="/"
        className="brand"
        onClick={() => setOpen(false)}
        aria-label="Elparaiso Hotel homepage"
      >
        <img className="brand-logo" src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel — Simply Amazing" width="1970" height="800" fetchPriority="high" />
      </Link>

      <Link className="nav-book header-book" to="/booking">Book a stay</Link>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="main-navigation"
      >
        {open ? <X size={25} /> : <Menu size={25} />}
      </button>

      <nav
        id="main-navigation"
        className={open ? "nav-links active" : "nav-links"}
        aria-label="Main navigation"
      >
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              isActive ? "nav-link active-link" : "nav-link"
            }
            onClick={() => setOpen(false)}
          >
            {link.name}
          </NavLink>
        ))}

        <NavLink
          to="/booking"
          className="nav-book"
          onClick={() => setOpen(false)}
        >
          Book Your Stay
          <ChevronRight size={15} />
        </NavLink>
      </nav>
    </header>
  );
}
