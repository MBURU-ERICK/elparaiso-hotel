
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  RefreshCw,
  House,
} from "lucide-react";

import { staffApi } from "../services/staffApi";
import "../styles/staff.css";
import "../styles/staffReservations.css";
import "../styles/staffAirbnb.css";

const STATUSES = [
  ["", "All bookings"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["checked_in", "Checked in"],
  ["checked_out", "Checked out"],
  ["cancelled", "Cancelled"],
];

const ACTIONS = {
  pending: [
    ["confirm", "Confirm"],
    ["cancel", "Cancel"],
  ],
  confirmed: [
    ["check-in", "Check in"],
    ["cancel", "Cancel"],
  ],
  checked_in: [["check-out", "Check out"]],
};

function formatMoney(value) {
  if (value === null || value === undefined) {
    return "Restricted";
  }

  return `KSh ${Number(value).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function StaffAirbnb() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);

    try {
      const data = await staffApi.airbnbBookings(filter);
      setBookings(data);
      setError("");
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/staff/login", { replace: true });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      try {
        const data = await staffApi.airbnbBookings(filter);

        if (!cancelled) {
          setBookings(data);
          setError("");
        }
      } catch (err) {
        if (cancelled) return;

        if (err.status === 401 || err.status === 403) {
          navigate("/staff/login", { replace: true });
        } else {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBookings();

    return () => {
      cancelled = true;
    };
  }, [filter, navigate]);

  async function performAction(booking, action) {
    if (busyId !== null) return;

    const label = action.replaceAll("-", " ");

    if (
      !window.confirm(
        `${label} booking #${booking.id} for ${booking.guest_name}?`
      )
    ) {
      return;
    }

    setBusyId(booking.id);
    setError("");
    setNotice("");

    try {
      await staffApi.airbnbAction(booking.id, action);

      setNotice(
        `Booking #${booking.id}: ${label} completed successfully.`
      );

      await loadBookings();
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/staff/login", { replace: true });
      } else {
        setError(err.message);
      }
    } finally {
      setBusyId(null);
    }
  }

  const pending = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmed = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const checkedIn = bookings.filter(
    (booking) => booking.status === "checked_in"
  ).length;

  return (
    <main className="staff-dashboard staff-airbnb">
      <header className="staff-header">
        <div>
          <p className="staff-eyebrow">ELPARAISO HOTEL</p>
          <h1>Airbnb Management</h1>
          <p>Manage short-stay reservations and guest arrivals.</p>
        </div>

        <Link
          to="/staff/dashboard"
          className="staff-back-link"
        >
          Back to dashboard
        </Link>
      </header>

      {error && (
        <p className="staff-alert staff-alert-error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="staff-alert staff-alert-success" role="status">
          {notice}
        </p>
      )}

      <section className="staff-stats">
        {[
          ["Bookings in view", bookings.length, House],
          ["Pending", pending, CalendarDays],
          ["Confirmed", confirmed, CalendarDays],
          ["Checked in", checkedIn, House],
        ].map(([label, value, Icon]) => (
          <article className="staff-stat" key={label}>
            <Icon size={22} aria-hidden="true" />
            <p>{label}</p>
            <h2>{value}</h2>
          </article>
        ))}
      </section>

      <section className="staff-filters">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter Airbnb bookings"
        >
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={loadBookings}
          disabled={loading || busyId !== null}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </button>
      </section>

      <section className="staff-table-section">
        <h2>Short-stay reservations</h2>

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found for this selection.</p>
        ) : (
          <div className="staff-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Guest</th>
                  <th>Unit</th>
                  <th>Stay</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>

                    <td>
                      <strong>{booking.guest_name}</strong>
                      <div className="staff-muted">
                        {booking.guest_phone}
                      </div>
                    </td>

                    <td>
                      {booking.unit_name}
                      <div className="staff-muted">
                        Unit #{booking.unit_id}
                      </div>
                    </td>

                    <td>
                      {booking.check_in}
                      <div className="staff-muted">
                        to {booking.check_out}
                      </div>
                      <div className="staff-muted">
                        {booking.nights} nights
                      </div>
                    </td>

                    <td>
                      {formatMoney(booking.total_amount)}
                    </td>

                    <td>
                      <span
                        className={`staff-status staff-status-${booking.status}`}
                      >
                        {booking.status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      <div className="staff-action-buttons">
                        {(ACTIONS[booking.status] || []).map(
                          ([action, label]) => (
                            <button
                              key={action}
                              type="button"
                              disabled={busyId !== null}
                              className={
                                action === "cancel"
                                  ? "staff-danger"
                                  : ""
                              }
                              onClick={() =>
                                performAction(booking, action)
                              }
                            >
                              {busyId === booking.id
                                ? "Working..."
                                : label}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="staff-airbnb-note">
        Booking totals represent reservation values, not
        confirmed payments. Actions are validated by the
        backend against your facility permissions.
      </p>
    </main>
  );
}
