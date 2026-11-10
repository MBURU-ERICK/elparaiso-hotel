import WorkspaceHeader from '../components/WorkspaceHeader';
import StaffReservationCard from '../components/StaffReservationCard';

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
  checked_out: [["invite-review", "Email review invitation"]],
  cancelled: [["delete", "Delete cancelled booking"]],
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
      <WorkspaceHeader eyebrow="YOUR PRIVATE-STAY GUEST COLLECTION" title="Airbnb reservations" description="Manage each private stay with the same care, from confirmation to checkout." actions={<Link className="portal-button" to="/staff/airbnb/rooms">Manage Airbnb rooms →</Link>} />

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

      <section className="reservation-collection-section">
        <div className="workspace-panel-heading"><h2>Short-stay reservations</h2><span>{bookings.length} in view</span></div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found for this selection.</p>
        ) : (
          <div className="reservation-collection-grid">{bookings.map(booking => <StaffReservationCard airbnb booking={booking} key={booking.id}><div className="staff-action-buttons">
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
                      </div></StaffReservationCard>)}</div>
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
