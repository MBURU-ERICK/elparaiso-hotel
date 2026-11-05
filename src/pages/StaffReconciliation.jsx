
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { staffApi } from "../services/staffApi";
import "../styles/staff.css";


const DECISIONS = [
  { value: "investigate", label: "Investigate" },
  { value: "rejected", label: "Reject" },
  { value: "resolved", label: "Resolve" },
];

function formatLabel(value) {
  return String(value ?? "—").replaceAll("_", " ");
}

function formatAmount(value) {
  return Number(value).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function StaffReconciliation() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const facilities = user.facilities.filter(f => f.actions.includes("payments_manage"));
  const [facilityId, setFacilityId] = useState(() => facilities[0]?.id || "");

  const [report, setReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("investigate");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    if (!facilityId) return;
    setLoading(true);
    setError("");

    try {
      await staffApi.me();

      const [dashboard, queue] = await Promise.all([
        staffApi.reconciliation(facilityId),
        staffApi.reconciliationRows(facilityId, filter),
      ]);

      setReport(dashboard);
      setRows(queue.results ?? []);
    } catch (err) {
      if (err.status === 401) {
        navigate("/staff/login", { replace: true });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [filter, navigate, facilityId]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (!facilityId) { setLoading(false); return; }
      setLoading(true);
      setError("");

      try {
        await staffApi.me();

        const [dashboard, queue] = await Promise.all([
          staffApi.reconciliation(facilityId),
          staffApi.reconciliationRows(facilityId, filter),
        ]);

        if (!active) return;

        setReport(dashboard);
        setRows(queue.results ?? []);
      } catch (err) {
        if (!active) return;

        if (err.status === 401) {
          navigate("/staff/login", { replace: true });
        } else {
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [filter, navigate, facilityId]);

  function openReview(row) {
    if (row.review) return;

    setSelected(row);
   setDecision("investigate");
    setNotes("");
    setError("");
    setNotice("");
  }

  function closeReview() {
    if (saving) return;

    setSelected(null);
    setDecision("investigate");
    setNotes("");
  }

  async function submitReview(event) {
    event.preventDefault();

    if (!selected || saving) return;

    const cleanNotes = notes.trim();

    if (!cleanNotes) {
      setError("Review notes are required.");
      return;
    }

    if (
      decision === "resolved" &&
      selected.classification?.toLowerCase() !== "candidate"
    ) {
      setError(
        "Only matched candidate transactions can be resolved."
      );
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await staffApi.reviewStatementRow(
        facilityId,
        selected.id,
        decision,
        cleanNotes
      );

      setSelected(null);
      setNotes("");
      setNotice(
        `Review saved for receipt ${selected.receipt}.`
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const summary = report?.summary ?? {};

  const stats = [
    ["Imported", summary.total ?? 0],
    ["Candidates", summary.candidates ?? 0],
    ["Unmatched", summary.unmatched ?? 0],
    ["Conflicts", summary.conflicts ?? 0],
    ["Awaiting review", summary.awaiting_review ?? 0],
    ["Reviewed", summary.reviewed ?? 0],
  ];

  return (
    <main className="staff-dashboard">
      <header className="staff-header">
        <div>
          <p className="staff-eyebrow">ELPARAISO HOTEL</p>
          <h1>M-Pesa Reconciliation</h1>
          <p>
            Statement reconciliation and independent accountant review
          </p>
        </div>

        <Link to="/staff/dashboard">
          Back to dashboard
        </Link>
      </header>

      <label htmlFor="reconciliation-facility">Facility</label>
      <select id="reconciliation-facility" value={facilityId} disabled={saving} onChange={event => {
        setSelected(null); setReport(null); setRows([]); setLoading(true); setFacilityId(Number(event.target.value));
      }}>{facilities.map(f => <option value={f.id} key={f.id}>{f.name}</option>)}</select>
      {!facilities.length && <p>No facilities are available for your reconciliation permissions.</p>}
      <section className="staff-table-section">
        <strong>Sandbox reconciliation</strong>
        <p>
          Imported statement records are not independently
          verified payment evidence. Financial settlement is disabled.
        </p>
      </section>

      {notice && (
        <p className="staff-alert staff-alert-success" role="status">
          {notice}
        </p>
      )}

      {error && (
        <p className="staff-alert staff-alert-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading reconciliation data...</p>
      ) : report ? (
        <>
          <section className="staff-stats">
            {stats.map(([label, value]) => (
              <article className="staff-stat" key={label}>
                <p>{label}</p>
                <h2>{value}</h2>
              </article>
            ))}
          </section>

          <section className="staff-table-section">
            <h2>Statement review queue</h2>

            <div className="staff-filters">
              <label htmlFor="review-filter">
                Review status
              </label>

              <select
                id="review-filter"
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
              >
                <option value="pending">Pending review</option>
                <option value="reviewed">Reviewed</option>
                <option value="all">All transactions</option>
              </select>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
              >
                Refresh
              </button>
            </div>

            <div className="staff-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Amount</th>
                    <th>Classification</th>
                    <th>Reason</th>
                    <th>Review status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.receipt}</td>

                      <td>
                        KSh {formatAmount(row.amount)}
                      </td>

                      <td>
                        {formatLabel(row.classification)}
                      </td>

                      <td>{formatLabel(row.reason)}</td>

                      <td>
                        {row.review
                          ? formatLabel(row.review.decision)
                          : "Pending"}
                      </td>

                      <td>
                        {row.review ? (
                          <span>Reviewed</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openReview(row)}
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length === 0 && (
              <p>No transactions found for this filter.</p>
            )}
          </section>
        </>
      ) : null}

      {selected && (
        <div className="staff-modal-backdrop">
          <section
            className="staff-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="statement-review-title"
          >
            <h2 id="statement-review-title">
              Review statement transaction
            </h2>

            <p>
              <strong>Receipt:</strong> {selected.receipt}
            </p>

            <p>
              <strong>Amount:</strong> KSh{" "}
              {formatAmount(selected.amount)}
            </p>

            <p>
              <strong>Classification:</strong>{" "}
              {formatLabel(selected.classification)}
            </p>

            <p>
              <strong>Matching reason:</strong>{" "}
              {formatLabel(selected.reason)}
            </p>

            <p>
              <strong>Linked payment ID:</strong>{" "}
              {selected.payment_id ?? "None"}
            </p>

            <form onSubmit={submitReview}>
              <label htmlFor="review-decision">
                Review decision
              </label>

              <select
                id="review-decision"
                value={decision}
                onChange={(event) =>
                  setDecision(event.target.value)
                }
                disabled={saving}
              >
                {DECISIONS.filter(
                  (option) =>
                    option.value !== "resolved"||
                    selected.classification?.toLowerCase() ===
                      "candidate"
                ).map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <label htmlFor="review-notes">
                Accountant notes
              </label>

              <textarea
                id="review-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Explain the evidence, discrepancy, or reason for this decision."
                rows={5}
                required
                disabled={saving}
              />

              <p>
                Your decision is recorded for audit purposes.
                It does not verify or settle a payment.
              </p>

              <div className="staff-modal-actions">
                <button
                  type="button"
                  className="staff-secondary"
                  onClick={closeReview}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !notes.trim()}
                >
                  {saving ? "Saving..." : "Submit review"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
