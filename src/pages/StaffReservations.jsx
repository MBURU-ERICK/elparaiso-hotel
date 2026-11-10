import WorkspaceHeader from '../components/WorkspaceHeader';
import StaffReservationCard from '../components/StaffReservationCard';

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
  delete: "Permanently delete cancelled reservation",
  "invite-review": "Email review invitation",
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
      <WorkspaceHeader eyebrow="YOUR HOTEL GUEST COLLECTION" title="Hotel reservations" description="Welcome the next guest. Manage room assignments, arrivals and departures from one place." actions={<Link className="portal-button" to="/staff/customers">Website booking inbox →</Link>} />

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

      <section className="reservation-collection-section">
        <div className="workspace-panel-heading"><h2>Guest reservations</h2><span>{reservations.length} in view</span></div>

        {loading ? (
          <p>Loading reservations...</p>
        ) : reservations.length === 0 ? (
          <p>No matching reservations found.</p>
        ) : (
          <div className="reservation-collection-grid">{reservations.map(booking => <StaffReservationCard booking={booking} key={booking.id}><div className="staff-action-buttons">
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

                        {booking.status === "checked_out" && <button type="button" disabled={busy} onClick={() => performAction(booking, "invite-review")}>Email review invitation</button>}
                        {booking.status === "cancelled" && <button type="button" className="staff-danger" disabled={busy} onClick={() => performAction(booking, "delete")}>Delete cancelled booking</button>}
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
                      </div></StaffReservationCard>)}</div>
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
