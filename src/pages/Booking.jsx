import { useCustomer } from "../customer/context";
import { useRoomPreferences } from "../hooks/useRoomPreferences";
import { RoomFilters, FavouriteRoom } from "../components/RoomPreferences";
import { todayInNairobi, nextStayDate } from "../utils/stayDates";
import SEO from "../components/SEO";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import {
  getRoomTypes,
  checkAvailability,
  createReservation,
} from "../services/bookingApi";

import "./Booking.css";

export default function Booking() {
  const preferences = useRoomPreferences();
  const [search] = useSearchParams();
  const { user } = useCustomer();
  const [rooms, setRooms] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(null);

  const [form, setForm] = useState({
    guest_name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    room_type: search.get("room_type") || "",
    check_in: search.get("check_in") || "",
    check_out: search.get("check_out") || "",
    adults: search.get("adults") === "2" ? 2 : 1,
    children: 0,
    special_requests: "",
  });

  useEffect(() => {
    getRoomTypes()
      .then(setRooms)
      .catch(() => setMessage("Unable to load rooms."));
  }, []);

  const today = todayInNairobi();
  const earliestCheckout = nextStayDate(form.check_in >= today ? form.check_in : today);
  const selectedRoom = rooms.find(
    (room) => room.id === Number(form.room_type)
  );

  const nights =
    form.check_in && form.check_out
      ? Math.max(
          0,
          Math.round(
            (Date.parse(form.check_out) -
              Date.parse(form.check_in)) /
              86400000
          )
        )
      : 0;

  const rate = selectedRoom
    ? Number(
        form.adults === 2 && form.children === 0
          ? (selectedRoom.double_occupancy_rate ?? selectedRoom.nightly_rate)
          : selectedRoom.nightly_rate
      )
    : 0;

  const total = rate * nights;

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      ...(name === "check_in" && previous.check_out <= value ? { check_out: "" } : {}),
      [name]:
        ["adults", "children", "room_type"].includes(name)
          ? Number(value)
          : value,
    }));

    setAvailability(null);
    setMessage("");
  }

  async function handleAvailability() {
    if (form.check_in < today || form.check_out < earliestCheckout) { setMessage("Choose today or a future check-in and a later check-out."); return; }
    setLoading(true);
    setMessage("");

    try {
      const result = await checkAvailability(
        form.check_in,
        form.check_out
      );

      setAvailability(result);
    } catch {
      setMessage("Unable to check availability.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.check_in < today || form.check_out < earliestCheckout) { setMessage("Choose today or a future check-in and a later check-out."); return; }
    setLoading(true);
    setMessage("");

    try {
      const result = await createReservation(form);
      setBooking(result);
    } catch {
      setMessage(
        "Booking request failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  if (booking) {
    return (
      <main className="booking-page">
        <section className="booking-container">
          <h1>Booking Request Received</h1>
          <Link to="/account">Track your booking in your portal →</Link>
          <p>
            Thank you, {booking.guest_name}.
            Your reservation request has been received.
          </p>
          <p>Reference: #{booking.id}</p>
          <p>
            Our team will contact you to confirm availability.
          </p>
        </section>
      </main>
    );
  }

  const availableCategory = availability?.room_types?.find(
    (room) => room.id === Number(form.room_type)
  );

  const canSubmit =
    availability?.check_in === form.check_in &&
    availability?.check_out === form.check_out &&
    availableCategory?.available_rooms > 0 &&
    form.check_in >= today &&
    form.check_out >= earliestCheckout &&
    nights > 0 &&
    selectedRoom &&
    form.adults >= 1 &&
    form.children === 0 &&
    form.adults <= selectedRoom.max_occupancy;

  return (
    <main className="booking-page">
      <section className="booking-container">
        <SEO title="Reserve Your Stay" description="Request a stay at Elparaiso Hotel." path="/booking" noindex />
        <Link className="booking-back" to="/rooms">← Explore all stays</Link>
        <span className="section-kicker">YOUR NEXT ELPARAISO STAY</span>
        <h1>Make yourself at home.</h1>
        <p>
          Experience comfort and hospitality at Elparaiso Hotel,
          Rumuruti.
        </p>

        <fieldset className="booking-room-picker">
          <legend>Find your room</legend>
          <p>Select a room category, then choose your dates to check availability.</p>
          <RoomFilters rooms={rooms} preferences={preferences} />
          <div className="booking-room-cards">
            {preferences.filter(rooms).map(room => <div className="booking-room-choice" key={room.id}><FavouriteRoom room={room} preferences={preferences} /><button type="button" className="booking-room-card" aria-pressed={Number(form.room_type) === room.id} onClick={() => { setForm(previous => ({ ...previous, room_type: room.id, adults: Math.min(previous.adults, room.max_occupancy), guest_name: previous.guest_name || user?.name || '', email: previous.email || user?.email || '', phone: previous.phone || user?.phone || '' })); setAvailability(null); setMessage(''); }}>
              {room.image_url ? <img src={room.image_url} alt={room.name} loading="lazy" onError={event => { event.currentTarget.hidden = true; }} /> : <span className="booking-room-placeholder">Your stay at Elparaiso</span>}
              <span className="booking-room-copy"><strong>{room.name}</strong><span>{room.description}</span><span>Up to {room.max_occupancy} guests</span><strong>From KSh {Number(room.nightly_rate).toLocaleString()} / night</strong><span>{Number(form.room_type) === room.id ? 'Selected ✓' : 'Choose this room'}</span></span>
            </button></div>)}
          </div>
          {rooms.length > 0 && !preferences.filter(rooms).length && <p role="status">No rooms match these filters. Choose another classification or switch off favourites.</p>}
          {!rooms.length && <p role="status">{message || 'Loading rooms…'}</p>}
        </fieldset>
        {user && <p className="booking-profile-note">Booking as {user.name}. Your contact details are filled in below; you can update your name and phone for this stay.</p>}
        <form onSubmit={handleSubmit} className="booking-form">
          <label>
            Room Category
            <select
              name="room_type"
              value={form.room_type}
              onChange={updateField}
              required
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>

          {selectedRoom?.image_url && (
            <img
              className="booking-room-image"
              src={selectedRoom.image_url}
              alt={selectedRoom.name}
            />
          )}

          <div className="booking-grid">
            <label>
              Check-in
              <input
                type="date"
                name="check_in"
                min={today}
                value={form.check_in}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Check-out
              <input
                type="date"
                name="check_out"
                min={earliestCheckout}
                value={form.check_out}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Adults
              <select
                name="adults"
                value={form.adults}
                onChange={updateField}
              >
                <option value="1">1 adult</option>
                <option value="2">2 adults</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleAvailability}
            disabled={
              loading ||
              !form.room_type ||
              !form.check_in ||
              !form.check_out ||
              nights < 1
            }
          >
            Check Availability
          </button>

          {availableCategory && (
            <p>
              Available rooms: {availableCategory.available_rooms}
            </p>
          )}

          {selectedRoom && nights > 0 && (
            <div className="booking-price">
              <p>
                KSh {rate.toLocaleString()} × {nights} nights
              </p>
              <h2>KSh {total.toLocaleString()}</h2>
              <small>Breakfast included</small>
            </div>
          )}

          <label>
            Full Name
            <input
              name="guest_name"
              value={form.guest_name}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Phone Number
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly={Boolean(user)}
              onChange={updateField}
            />
          </label>

          <label>
            Special Requests
            <textarea
              name="special_requests"
              value={form.special_requests}
              onChange={updateField}
            />
          </label>

          {message && <p role="alert">{message}</p>}

          <button type="submit" disabled={loading || !canSubmit}>
            {loading ? "Processing..." : "Request Reservation"}
          </button>
        </form>
      </section>
    </main>
  );
}
