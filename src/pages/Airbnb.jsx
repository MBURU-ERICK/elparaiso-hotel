
import { useEffect, useState } from "react";
import {
  BedDouble,
  Users,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import { shortstayApi } from "../services/shortstayApi";
import "../styles/staffAirbnb.css";

const emptyForm = {
  guest_name: "",
  guest_phone: "",
  guest_email: "",
  guests: 1,
};

export default function Airbnb() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [availability, setAvailability] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    let active = true;

    shortstayApi.units()
      .then((data) => {
        if (active) setUnits(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function selectUnit(unit) {
    setSelected(unit);
    setAvailability(null);
    setReceipt(null);
    setError("");
    setForm(emptyForm);
  }

  async function checkAvailability(event) {
    event.preventDefault();

    if (!selected) return;

    setBusy(true);
    setError("");
    setAvailability(null);

    try {
      const result = await shortstayApi.availability(
        selected.id,
        checkIn,
        checkOut
      );
      setAvailability(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (!selected || !availability?.available) return;

    setBusy(true);
    setError("");

    try {
      const result = await shortstayApi.createBooking({
        unit_id: selected.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_name: form.guest_name,
        guest_phone: form.guest_phone,
        guest_email: form.guest_email,
        guests: Number(form.guests),
      });

      setReceipt(result);
      setAvailability(null);
    } catch (err) {
      setAvailability(null);

      if (err.status === 429) {
        setError(
          "Too many booking attempts. Please wait before trying again."
        );
      } else if (err.status === 409) {
        setError(
          "This accommodation was just booked for those dates. Please select different dates."
        );
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="airbnb-public">
      <header className="airbnb-hero">
        <p className="staff-eyebrow">ELPARAISO GARDEN</p>
        <h1>Stay a Little Longer</h1>
        <p>
          Explore our short-stay accommodation and find
          a comfortable place to call home.
        </p>
      </header>

      {error && (
        <p className="staff-alert staff-alert-error" role="alert">
          {error}
        </p>
      )}

      <section className="airbnb-public-content">
        <h2>Available accommodation</h2>

        {loading ? (
          <p>Loading accommodation...</p>
        ) : units.length === 0 ? (
          <p>No short-stay units are currently published.</p>
        ) : (
          <div className="airbnb-unit-grid">
            {units.map((unit) => (
              <article className="airbnb-unit-card" key={unit.id}>
                <div className="airbnb-unit-icon">
                  <BedDouble size={36} aria-hidden="true" />
                </div>

                <div className="airbnb-unit-body">
                  <p className="airbnb-property-name">
                    {unit.property_name}
                  </p>

                  <h3>{unit.name}</h3>
                  <p>{unit.description}</p>

                  <div className="airbnb-unit-details">
                    <span>
                      <Users size={16} aria-hidden="true" />
                      Up to {unit.max_guests} guests
                    </span>
                    <span>
                      <BedDouble size={16} aria-hidden="true" />
                      {unit.bedrooms} bedrooms
                    </span>
                  </div>

                  <p className="airbnb-price">
                    KSh {Number(unit.nightly_rate).toLocaleString("en-KE")}
                    <small> / night</small>
                  </p>

                  <button
                    type="button"
                    onClick={() => selectUnit(unit)}
                  >
                    Check availability
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {selected && (
          <section className="airbnb-booking-panel">
            <h2>Book {selected.name}</h2>

            {receipt ? (
              <div className="airbnb-receipt" role="status">
                <CheckCircle2 size={34} aria-hidden="true" />
                <h3>Booking request received</h3>
                <p>Booking number: #{receipt.id}</p>
                <p>Status: {receipt.status}</p>
                <p>
                  Total reservation value: KSh{" "}
                  {Number(receipt.total_amount).toLocaleString("en-KE")}
                </p>
                <p>
                  Your booking is pending confirmation.
                  Please keep your booking number.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setReceipt(null);
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <form
                  className="airbnb-booking-form"
                  onSubmit={checkAvailability}
                >
                  <label>
                    Check-in
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(event) => {
                        setCheckIn(event.target.value);
                        setAvailability(null);
                      }}
                      required
                    />
                  </label>

                  <label>
                    Check-out
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(event) => {
                        setCheckOut(event.target.value);
                        setAvailability(null);
                      }}
                      required
                    />
                  </label>

                  <button type="submit" disabled={busy}>
                    <CalendarDays size={17} aria-hidden="true" />
                    {busy ? "Checking..." : "Check dates"}
                  </button>
                </form>

                {availability && !availability.available && (
                  <p className="staff-alert staff-alert-error">
                    This unit is unavailable for the selected dates.
                  </p>
                )}

                {availability?.available && (
                  <form
                    className="airbnb-booking-form"
                    onSubmit={submitBooking}
                  >
                    <p className="staff-alert staff-alert-success">
                      Dates available. Enter your guest details.
                    </p>

                    <label>
                      Full name
                      <input
                        required
                        maxLength={150}
                        value={form.guest_name}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            guest_name: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Phone number
                      <input
                        type="tel"
                        required
                        maxLength={30}
                        value={form.guest_phone}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            guest_phone: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Email (optional)
                      <input
                        type="email"
                        value={form.guest_email}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            guest_email: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Guests
                      <input
                        type="number"
                        min="1"
                        max={selected.max_guests}
                        required
                        value={form.guests}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            guests: event.target.value,
                          })
                        }
                      />
                    </label>

                    <button type="submit" disabled={busy}>
                      {busy ? "Submitting..." : "Request booking"}
                    </button>
                  </form>
                )}
              </>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
