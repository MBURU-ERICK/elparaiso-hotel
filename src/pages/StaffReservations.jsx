
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { staffApi } from "../services/staffApi";
import "../styles/staff.css";
import "../styles/staffReservations.css";

const STATUSES = [
  ["", "All statuses"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["checked_in", "Checked in"],
  ["checked_out", "Checked out"],
  ["cancelled", "Cancelled"],
];

const ACTION_LABELS = {
  "check-in": "Check in",
  "check-out": "Check out",
  cancel: "Cancel reservation",
};

function errorMessage(error) {
  if (typeof error.message === "string") {
    return error.message;
  }
  return "An unexpected error occurred.";
}

export default function StaffReservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selected, setSelected] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [roomsLoading, setRoomsLoading] = useState(false);

  const loadReservations = useCallback(async () => {
    

    try {
      const data = await staffApi.reservations(search, filter);
      setReservations(data.results);
      setError("");
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        navigate("/staff/login", { replace: true });
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [search, filter, navigate]);

  useEffect(() => {
  let cancelled = false;

  async function fetchReservations() {
    try {
      const data = await staffApi.reservations(search, filter);

      if (!cancelled) {
        setReservations(data.results);
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

  fetchReservations();

  return () => {
    cancelled = true;
  };
}, [search, filter, navigate]);

  async function openConfirmation(booking) {
    setSelected(booking);
    setRoomId("");
    setRooms([]);
    setError("");
    setRoomsLoading(true);

    try {
      const data = await staffApi.availableRooms(booking.id);
      setRooms(data.rooms);
    } catch (err) {
      setError(errorMessage(err));
      setSelected(null);
    } finally {
      setRoomsLoading(false);
    }
  }

  async function confirmBooking(event) {
    event.preventDefault();

    if (!selected || !roomId || busy) return;

    setBusy(true);
    setError("");

    try {
      await staffApi.confirmReservation(
        selected.id,
        Number(roomId)
      );

      setNotice(`${selected.reference} confirmed successfully.`);
      setSelected(null);
      await loadReservations();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function performAction(booking, action) {
    if (busy) return;

    const label = ACTION_LABELS[action];

    if (
      !window.confirm(
        `${label} for ${booking.reference} (${booking.guest_name})?`
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await staffApi.reservationAction(booking.id, action);

      setNotice(`${booking.reference}: ${label} successful.`);
      await loadReservations();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="staff-dashboard staff-reservations">
      <header className="staff-header">
        <div>
          <p className="staff-eyebrow">ELPARAISO HOTEL</p>
          <h1>Reservation Management</h1>
          <p>Manage guest bookings and room assignments.</p>
        </div>

        <Link to="/staff/dashboard" className="staff-back-link">
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

      <section className="staff-filters">
        <input
          type="search"
          placeholder="Search guest, phone or ELP reference"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search reservations"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter by status"
        >
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={loadReservations}
          disabled={loading}
        >
          Refresh
        </button>
      </section>

      <section className="staff-table-section">
        <h2>Guest reservations</h2>

        {loading ? (
          <p>Loading reservations...</p>
        ) : reservations.length === 0 ? (
          <p>No matching reservations found.</p>
        ) : (
          <div className="staff-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Stay</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {reservations.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.reference}</td>

                    <td>
                      <strong>{booking.guest_name}</strong>
                      <div className="staff-muted">
                        {booking.phone}
                      </div>
                    </td>

                    <td>{booking.room || "Unassigned"}</td>

                    <td>
                      {booking.check_in}
                      <div className="staff-muted">
                        to {booking.check_out}
                      </div>
                    </td>

                    <td>
                      KSh{" "}
                      {Number(booking.total_amount).toLocaleString(
                        "en-KE"
                      )}
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
                        {booking.status === "pending" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => openConfirmation(booking)}
                          >
                            Confirm
                          </button>
                        )}

                        {booking.status === "confirmed" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              performAction(booking, "check-in")
                            }
                          >
                            Check in
                          </button>
                        )}

                        {booking.status === "checked_in" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              performAction(booking, "check-out")
                            }
                          >
                            Check out
                          </button>
                        )}

                        {["pending", "confirmed"].includes(
                          booking.status
                        ) && (
                          <button
                            type="button"
                            className="staff-danger"
                            disabled={busy}
                            onClick={() =>
                              performAction(booking, "cancel")
                            }
                          >
                            Cancel
                          </button>
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

      {selected && (
        <div className="staff-modal-backdrop">
          <section
            className="staff-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-booking-title"
          >
            <h2 id="confirm-booking-title">
              Confirm {selected.reference}
            </h2>

            <p>
              <strong>Guest:</strong> {selected.guest_name}
            </p>
            <p>
              <strong>Category:</strong> {selected.room_type}
            </p>
            <p>
              <strong>Stay:</strong> {selected.check_in} to{" "}
              {selected.check_out}
            </p>

            <form onSubmit={confirmBooking}>
              <label htmlFor="reservation-room">
                Available room
              </label>

              <select
                id="reservation-room"
                value={roomId}
                onChange={(event) =>
                  setRoomId(event.target.value)
                }
                required
                disabled={roomsLoading || busy}
              >
                <option value="">Select a room</option>

                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.room_number}
                  </option>
                ))}
              </select>

              {!roomsLoading && rooms.length === 0 && (
                <p>No rooms available for these dates.</p>
              )}

              <div className="staff-modal-actions">
                <button
                  type="button"
                  className="staff-secondary"
                  onClick={() => setSelected(null)}
                  disabled={busy}
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={!roomId || busy || roomsLoading}
                >
                  {busy ? "Confirming..." : "Confirm booking"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
