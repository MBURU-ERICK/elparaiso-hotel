
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffApi } from "../services/staffApi";
import "../styles/staff.css";


export default function StaffDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        await staffApi.me();
        const data = await staffApi.dashboard();

        if (active) setDashboard(data);
      } catch (err) {
        if (!active) return;

        if (
          [401, 403].includes(err.status)
        ) {
          navigate("/staff/login", { replace: true });
        } else {
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (loading) return <p>Loading staff dashboard...</p>;

  if (error) return <p role="alert">{error}</p>;

  if (!dashboard) return null;

  const { summary, arrivals, departures, upcoming } = dashboard;

  const stats = [
    ["Total rooms", summary.total_rooms],
    ["Occupied rooms", summary.occupied_rooms],
    ["Vacant rooms", summary.available_rooms],
    ["Pending bookings", summary.pending_reservations],
    ["Outstanding arrivals", summary.arrivals_today],
    ["Scheduled departures", summary.departures_today],
  ];

  return (
    <main className="staff-dashboard">
      <header className="staff-header">
        <div>
          <p className="staff-eyebrow">ELPARAISO HOTEL</p>
          <h1>Hotel Operations</h1>
          <p>Operational date: {dashboard.date}</p>
        </div>
      </header>

      <section className="staff-stats">
        {stats.map(([label, value]) => (
          <article className="staff-stat" key={label}>
            <p>{label}</p>
            <h2>{value}</h2>
          </article>
        ))}
      </section>

    {summary.booked_accommodation_value !== null &&
 summary.booked_accommodation_value !== undefined && (
  <section className="staff-revenue">
    <h2>Booked accommodation value</h2>
    <p>
      KSh{" "}
      {Number(
        summary.booked_accommodation_value
      ).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
      })}
    </p>
    <small>Not actual payments collected.</small>
  </section>
)}

      <ReservationTable title="Today's arrivals" rows={arrivals} />
      <ReservationTable title="Today's departures" rows={departures} />
      <ReservationTable title="Upcoming bookings" rows={upcoming} />
    </main>
  );
}

function ReservationTable({ title, rows }) {
  return (
    <section className="staff-table-section">
      <h2>{title}</h2>

      {rows.length === 0 ? (
        <p>No reservations to display.</p>
      ) : (
        <div className="staff-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((booking) => (
                <tr key={booking.reference}>
                  <td>{booking.reference}</td>
                  <td>{booking.guest}</td>
                  <td>{booking.room || "Unassigned"}</td>
                  <td>{booking.check_in}</td>
                  <td>{booking.check_out}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
