# Past events and unanswered quote cleanup

Public events disappear after their end date in Africa/Nairobi. Events without an end date use their start date; undated events remain visible. The November 11–12, 2026 birthday event is therefore hidden from November 13. Both the events page and event booking dropdown filter dated events, including stale API responses. The page refreshes event data periodically and on focus; the date check updates while the page stays open. Public API responses also prohibit caching.

## Staff workflow

Open the staff guest requests page, select **Unanswered past-date quotes**, open a request and choose **Archive unanswered quote**. The list contains unconfirmed requests whose start date has passed and which have no recorded acceptance. Staff need the existing cancellation permission for that facility.

The backend rejects future requests, confirmed requests, accepted quotes and quotes with linked room or venue allocations. Archiving records the staff member and time. It retains original status, guest history, quotes and invoices, sends no email, and safely handles repeated submissions. Archived records remain accessible in the archive. Expired requests are excluded from the active queue and cannot receive new confirmations or allocations.

## Rollout

Deploy the backend update and run `python manage.py migrate` using the production configuration. This includes `customers.0012_guest_quote_archive`, which adds nullable audit fields. Restart the backend, then deploy the frontend build. The archive action requires the updated backend; the frontend reports an unavailable endpoint rather than claiming success. No production migration or deployment was performed during implementation.

## Verification

- Frontend build, lint, unit tests and SEO checks passed.
- All 123 backend tests passed against isolated PostgreSQL; no migration drift.
- Browser checks at 360, 390, 768, 1024 and 1440 pixels verified expired-event removal, future events, the booking dropdown and no horizontal overflow.
- Browser checks verified the past-events empty state and mobile staff cleanup workflow using intercepted API fixtures; no runtime exceptions.
- Backend integration tests verify permissions, archive audit fields, repeated requests, preserved invoices, unchanged email behavior and rejection of ineligible requests.

The live API was observed returning the old birthday event during the audit. Local frontend filtering addresses that response, but the live site requires deployment to receive this fix.
