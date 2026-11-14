import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Menu, X, MapPin } from 'lucide-react';
import './navigation.css';
const links = [
  ['Home', '/'], ['Accommodation', '/rooms'], ['Restaurant', '/restaurant'],
  ['Private Stays', '/private-stays'], ['Experiences', '/experiences'],
  ['Events & Groups', '/events-groups'], ['Conferences', '/conferences'],
  ['About Us', '/about'], ['Contact', '/contact'],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('a')?.focus();
    const keyboard = event => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
      if (event.key === 'Tab') {
        const items = [...panel.current.querySelectorAll('a')];
        const first = items[0], last = items[items.length - 1];
        if (document.activeElement === toggle.current) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); toggle.current?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); toggle.current?.focus();
        }
      }
    };
    const resize = () => { if (window.innerWidth >= 1280) setOpen(false); };
    window.addEventListener('keydown', keyboard);
    window.addEventListener('resize', resize);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', keyboard); window.removeEventListener('resize', resize); };
  }, [open]);
  const close = () => { setOpen(false); if (open) toggle.current?.focus(); };
  return <header className="hotel-header"><div className="hotel-header-inner"><Link className="hotel-brand" to="/" aria-label="Elparaiso Hotel homepage" onClick={close}><img src="/images/Logo%20elparaiso.png" alt="Elparaiso Hotel — Simply Amazing" width="1970" height="800" /></Link><nav ref={panel} id="hotel-navigation" className={`hotel-navigation${open ? ' is-open' : ''}`} aria-label="Main navigation"><span className="hotel-nav-intro"><MapPin size={14} /> RUMURUTI, LAIKIPIA</span>{links.map(([label, path]) => <NavLink key={path} to={path} end={path === '/'} onClick={close}>{label}</NavLink>)}<span className="hotel-nav-note">A place to pause.<br /><em>A reason to return.</em></span></nav><Link className="hotel-header-book" to="/booking" onClick={close}>Book Your Stay <ArrowUpRight size={17} /></Link><button ref={toggle} className="hotel-menu-toggle" type="button" aria-controls="hotel-navigation" aria-expanded={open} aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(value => !value)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>{open && <button className="hotel-nav-backdrop" type="button" aria-label="Close navigation" tabIndex={-1} onClick={close} />}</header>;
}
