import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAvailability } from '../services/bookingApi';
import { todayInNairobi, nextStayDate } from '../utils/stayDates';

export default function BookingBar() {
  const navigate = useNavigate();
  const [arrival, setArrival] = useState(todayInNairobi);
  const [departure, setDeparture] = useState(() => nextStayDate(todayInNairobi()));
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
        if (active) setAvailability(count ? `${count} hotel rooms currently available for these dates. Final confirmation is by our team.` : 'No hotel rooms currently showing for these dates. Ask our team about other options.');
      }).catch(() => { if (active) setAvailability('Contact our team to confirm availability for your dates.'); });
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, [arrival, departure]);
  function submit(event) {
    event.preventDefault();
    const values = new URLSearchParams(new FormData(event.currentTarget));
    window.dispatchEvent(new CustomEvent('hotel:analytics', { detail: { event: 'booking-start', source: 'home' } }));
    navigate(`/booking?${values}`);
  }
  return <section id="plan-your-stay" className="direct-booking" aria-label="Plan your stay"><details className="booking-disclosure" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}><summary><span><strong>Your time in Laikipia</strong><small>Dates, guests & rooms</small></span><span className="booking-summary-action">Plan a stay <span aria-hidden="true">＋</span></span></summary><form onSubmit={submit}>
    <label>Check-in<input type="date" name="check_in" required min={todayInNairobi()} value={arrival} onChange={e => { setArrival(e.target.value); if (departure <= e.target.value) setDeparture(nextStayDate(e.target.value)); }} /></label>
    <label>Check-out<input type="date" name="check_out" required min={nextStayDate(arrival)} value={departure} onChange={e => setDeparture(e.target.value)} /></label>
    <label>Adults<input type="number" name="adults" defaultValue="2" min="1" max="100" required /></label>
    <label>Children<input type="number" name="children" defaultValue="0" min="0" max="100" required /></label>
    <label>Rooms<input type="number" name="rooms" defaultValue="1" min="1" max="100" required /></label>
    <button className="home-button" type="submit">Plan your stay →</button>
  </form><p aria-live="polite">{availability}</p><p>Book directly with our team · An email quotation · No payment taken here</p></details></section>;
}
