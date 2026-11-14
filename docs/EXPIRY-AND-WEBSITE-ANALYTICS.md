# Request expiry and admin website analytics

## Date rules

All date boundaries use Africa/Nairobi. A date remains valid for its whole calendar day.

| Record | Leaves the active dashboard when |
| --- | --- |
| New or responded quotation/request | `start_date < today` |
| Confirmed booking | `end_date < today` |
| Checked-in stay | Never expires automatically; staff must record checkout |
| Checked-out/cancelled record | Retained in the archive |

Expired requests cannot be accepted, reconfirmed, sent another active quotation, offered new accommodation, assigned another room or reserved a venue. Standalone hotel/private-stay pending confirmations also reject past arrival dates. Ended advertised events no longer appear in the public events catalogue or booking options; their original records remain available to administrators.

Expiry is **derived at read/action time**, rather than rewriting original statuses. API responses add `is_expired`, `display_status`, and `expires_after`. Original statuses, acceptance metadata, reservations, quotes, invoices, payment history and correspondence remain unchanged. No automatic cancellation, checkout, deletion or expiry email is performed. Existing outstanding invoice totals still include archived requests. Existing allocated inventory is retained for audit and manual review rather than silently cancelled.

The operational dashboard and default inbox exclude expired records. Dashboard/inbox lists refresh approximately every minute while open. The server checks expiry again for actions, even if a detail screen has remained open across midnight. This does not depend on Task Scheduler/cron or a background expiry job.

Use Booking inbox → View → Archive, or `/staff/customers?scope=archive&status=expired`. Filters also support `scope=active`, `scope=archive` and `scope=all`. Archived details remain accessible by ID under existing facility permissions. Use a new request for new dates; do not reopen expired requests by changing their old status.

## Admin dashboard

`/staff/admin` now includes Website performance, with:

- Recorded page views, planning/search actions and server-saved booking/quotation request counts.
- Daily interest chart and an accessible daily-numbers table.
- Most explored pages.
- Actual browser LCP, INP, CLS and TTFB measurements, sample counts, diagnostic averages and good-sample percentages.
- 7-, 30- and 90-day periods, refresh, genuine empty states and retry/error states.

Only active superusers can read the analytics endpoint. Ordinary staff and anonymous users are rejected by the backend, regardless of frontend visibility.

These are **not unique visitors, sessions, Google Analytics figures, Lighthouse scores or Google's 75th-percentile field assessment**. Page views include SPA navigation. The first final report for each metric/document is counted once, avoiding repeated samples on visibility changes. Vitals describe document lifetimes, not a new LCP measurement on every SPA route change. Missing/unsupported measurements are shown as unavailable, not invented. Traffic collection begins with this deployment; no historical visits are reconstructed. Server request counts use actual GuestReservation creation records and may predate traffic collection.

## Collection and privacy

The frontend uses Google's `web-vitals` library. Public page paths are normalized to a fixed allowlist. Staff/account/review/unknown paths are not tracked. Browser Do Not Track and Global Privacy Control are respected.

The collector receives only `{path, metric, value}`. It omits credentials and does not send URL queries, referrers, guest details or visitor IDs. No cookies, localStorage identifiers or fingerprints are introduced. Only per-day/path/metric aggregate counters and sums are stored in `core.WebsiteDailyMetric`; no raw visitor events or IP addresses are added to that analytics table. Existing server logging and transient rate-limiting infrastructure are separate from these aggregate records.

The public collector requires an allowed frontend Origin, validates route/metric/value ranges, and is rate-limited independently of booking. Client-reported measurements are best-effort diagnostic data and can be reduced by blockers, privacy settings, network failures or throttling. They are not suitable as audited financial figures. Backend booking request counts remain the server-side source.

Configuration:

- Frontend: `VITE_WEBSITE_ANALYTICS_ENABLED=false` disables collection after rebuilding; default enabled.
- Backend: `WEBSITE_ANALYTICS_ENABLED=False` disables new collection immediately after restart, retaining historical aggregates.
- Public POST: `/api/website-metrics/`.
- Protected GET: `/api/staff/admin/website-analytics/?days=30`.

No paid provider or external analytics account is required. Data is stored in the existing PostgreSQL database.

## Rollout

1. Back up and review the backend migration plan as usual.
2. Deploy backend code and apply the new aggregate-table migration (`core/0002_websitedailymetric.py`) using the project's normal migration process. Expiry itself requires no booking-data migration or backfill.
3. Restart the backend service. On Windows, use the existing supervised service; do not start an extra notification worker.
4. Deploy the frontend with its locked dependencies and existing API origin.
5. As an administrator, open `/staff/admin`. The traffic cards should initially show genuine empty values until public measurements arrive. Existing server booking counts can already be present.
6. Visit public pages with privacy opt-outs disabled, then refresh the analytics screen. Some vitals report only after interaction or when the document is hidden; INP may be absent until there is an eligible interaction.
7. Verify active/archive filters, expired-action rejection and a checked-in stay whose departure date has passed. Confirm invoice history/outstanding balances remain accessible.

No production deployment or production migration was performed in this task.

## Verification

- Full backend suite: **119 tests passed** in an isolated PostgreSQL instance, with in-memory test email; no production booking or email changes.
- Migration drift check: no changes detected beyond the included analytics migration; fresh schema migration passed.
- Frontend lint, tests, build and SEO/static-asset assertions passed.
- Browser QA used isolated test responses, not live traffic: admin layout at 360/390/768/1024/1440px, all four metric cards, period changes, empty/error states, archive selection, expired detail controls and allowed collection payload fields. No overflow or runtime exceptions in the checked flows. Staff screens emitted no tracking requests.
- Browser measurement smoke test emitted actual local-page CLS, INP, LCP, TTFB and page-view payloads to the intercepted test collector, with no runtime exceptions.
- Screenshots used test fixture values solely for layout inspection; no sample traffic is bundled or seeded into the application/database.

Primary measurement references: [Google web-vitals](https://github.com/GoogleChrome/web-vitals) and [Core Web Vitals thresholds](https://support.google.com/webmasters/answer/9205520).
