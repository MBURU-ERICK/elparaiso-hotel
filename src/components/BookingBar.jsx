import { CalendarDays, Users, ArrowUpRight } from 'lucide-react';
import './booking-compact.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAvailability } from '../services/bookingApi';
import { todayInNairobi, nextStayDate } from '../utils/stayDates';

export default function BookingBar() {
  const navigate = useNavigate();
  const [arrival, setArrival] = useState(todayInNairobi);
  const [departure, setDeparture] = useState(() => nextStayDate(todayInNairobi()));
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [rooms, setRooms] = useState('1');
  const [expanded, setExpanded] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 600px)');
    const update = () => setExpanded(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const [availability, setAvailability] = useState('');
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (!arrival || departure <= arrival) return;
      checkAvailability(arrival, departure).then(data => {
        const count = (data.room_types || []).reduce((sum, room) => sum + room.available_rooms, 0);
        if (active) setAvailability(count ? `${count} hotel rooms available · Subject to confirmation` : 'No rooms showing · Contact us for options');
      }).catch(() => { if (active) setAvailability('Ask our team to confirm availability'); });
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, [arrival, departure]);
  function submit(event) {
    event.preventDefault();
    const values = new URLSearchParams(new FormData(event.currentTarget));
    window.dispatchEvent(new CustomEvent('hotel:analytics', { detail: { event: 'booking-start', source: 'home' } }));
    navigate(`/booking?${values}`);
  }
  return <section id="plan-your-stay" className="direct-booking" aria-label="Plan your stay"><details className="booking-disclosure" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}><summary><span><strong>Your time in Laikipia</strong><small>Dates, guests & rooms</small></span><span className="booking-summary-action">Plan a stay <span aria-hidden="true">＋</span></span></summary><form onSubmit={submit} onInvalidCapture={event => { const panel = event.target.closest('details'); if (panel) panel.open = true; }}>
    <label><span><CalendarDays size={16} /> Check-in</span><input type="date" name="check_in" required min={todayInNairobi()} value={arrival} onChange={e => { setArrival(e.target.value); if (departure <= e.target.value) setDeparture(nextStayDate(e.target.value)); }} /></label>
    <label><span><CalendarDays size={16} /> Check-out</span><input type="date" name="check_out" required min={nextStayDate(arrival)} value={departure} onChange={e => setDeparture(e.target.value)} /></label>
    <details className="booking-guests"><summary><span><Users size={16} /> Guests & rooms</span><strong>{adults} adults · {children} children · {rooms} {rooms === '1' ? 'room' : 'rooms'}</strong></summary><div className="booking-guest-panel"><label>Adults<input type="number" name="adults" value={adults} onChange={e => setAdults(e.target.value)} min="1" max="100" required /></label><label>Children<input type="number" name="children" value={children} onChange={e => setChildren(e.target.value)} min="0" max="100" required /></label><label>Rooms<input type="number" name="rooms" value={rooms} onChange={e => setRooms(e.target.value)} min="1" max="100" required /></label></div></details>
    <button className="home-button" type="submit">Find a stay <ArrowUpRight size={18} /></button>
  </form><div className="booking-reassurance"><span aria-live="polite">{availability || 'Select your dates to plan a stay'}</span><span>No payment taken · Quote by email</span></div></details></section>;
}
