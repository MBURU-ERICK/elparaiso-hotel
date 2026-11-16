import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, MapPin } from 'lucide-react';
import './navigation.css';

const links = [
  ['Home', '/'], ['Accommodation', '/rooms'], ['Restaurant', '/restaurant'],
  ['Private Stays', '/private-stays'], ['Experiences', '/experiences'], ['Gallery', '/gallery'],
  ['Events & Groups', '/events-groups'], ['Conferences', '/conferences'],
  ['About Us', '/about'], ['Contact', '/contact'],
];

export default function Navbar() {
  const [openLocation, setOpenLocation] = useState(null);
  const toggle = useRef(null);
  const panel = useRef(null);
  const location = useLocation();
  const open = openLocation === location.key;

  function close() {
    if (panel.current?.hidePopover) panel.current.hidePopover();
    else setOpenLocation(null);
  }

  function openMenu() {
    if (panel.current?.showPopover) panel.current.showPopover({ source: toggle.current });
    else {
      setOpenLocation(location.key);
      requestAnimationFrame(() => panel.current?.querySelector('button')?.focus());
    }
  }

  useEffect(() => {
    // Also handles browser back/forward and navigation initiated elsewhere.
    if (panel.current?.hidePopover) panel.current.hidePopover();
  }, [location]);

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1280px)');
    const dismiss = () => {
      if (panel.current?.hidePopover) panel.current.hidePopover();
      else setOpenLocation(null);
    };
    const resize = () => { if (desktop.matches) dismiss(); };
    const escape = event => {
      if (event.key === 'Escape' && !panel.current?.hidePopover) {
        dismiss();
        toggle.current?.focus();
      }
    };
    desktop.addEventListener('change', resize);
    window.addEventListener('keydown', escape);
    return () => {
      document.documentElement.style.overflow = previous;
      desktop.removeEventListener('change', resize);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);

  const renderLinks = mobile => links.map(([label, path]) => (
    <NavLink key={path} to={path} end={path === '/'} onClick={mobile ? close : undefined}>
      <span>{label}</span>{mobile && <ArrowUpRight size={18} aria-hidden="true" />}
    </NavLink>
  ));

  return <header className="hotel-header">
    <div className="hotel-header-inner">
      <Link className="hotel-brand" to="/" aria-label="Elparaiso Hotel homepage"><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel — Simply Amazing" width="1970" height="800" /></Link>
      <nav className="hotel-navigation" aria-label="Main navigation">{renderLinks(false)}</nav>
      <Link className="hotel-header-book" to="/booking">Book Your Stay <ArrowUpRight size={17} aria-hidden="true" /></Link>
      <button ref={toggle} className="hotel-menu-toggle" type="button" aria-controls="hotel-mobile-navigation" aria-expanded={open} aria-label="Open navigation" onClick={open ? close : openMenu}><Menu size={22} aria-hidden="true" /></button>
    </div>
    <nav ref={panel} id="hotel-mobile-navigation" popover="auto" className={`hotel-mobile-navigation${open ? ' is-open' : ''}`} aria-label="Mobile navigation" onToggle={event => setOpenLocation(event.newState === 'open' ? location.key : null)}>
      <div className="hotel-mobile-heading">
        <span>ELPARAISO <small>HOTEL</small></span>
        <button type="button" className="hotel-mobile-close" autoFocus onClick={() => { close(); toggle.current?.focus(); }} aria-label="Close navigation"><X size={22} aria-hidden="true" /></button>
      </div>
      <div className="hotel-mobile-scroll">
        <p className="hotel-mobile-location"><MapPin size={14} aria-hidden="true" /> RUMURUTI, LAIKIPIA</p>
        <p className="hotel-mobile-title">Explore Elparaiso</p>
        <div className="hotel-mobile-links">{renderLinks(true)}</div>
        <div className="hotel-mobile-footer"><Link to="/booking" className="hotel-mobile-book" onClick={close}>Book Your Stay <ArrowUpRight size={20} aria-hidden="true" /></Link><p>A place to pause. A reason to return.</p></div>
      </div>
    </nav>
  </header>;
}
