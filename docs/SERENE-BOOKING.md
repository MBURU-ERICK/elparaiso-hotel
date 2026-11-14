# Serene stay-request experience

## Implementation
- `src/pages/StayBooking.jsx`: routed hotel/private stay wizard with dates, live room selection, guest details, review and server-response receipt. Conference/event URLs delegate to the existing GuestBooking form. Embedded event/conference forms remain unchanged.
- `src/styles/serene.css`: semantic palette, surfaces, text, borders, controls, focus, shadows, spacing, typography and motion tokens. Compatibility aliases apply the calm palette to existing guest components without changing staff styles.
- `src/styles/reservation.css`: responsive room cards, progress indicator, comparison table, forms and desktop sticky/mobile collapsible summary.
- `src/utils/reservationValidation.js`: strict calendar/date ordering, count and guest-contact validation.
- `src/utils/bookingQuote.js`: retained pricing rules with guards against non-finite, missing or nonpositive rates. No backend financial calculations modified.
- `src/App.jsx`: /booking now uses the stay wizard and retains legacy event/conference behavior.
- Footer and floating contact colours now resolve through the same palette. Focused tests added in gallery.test.mjs and stayDates.test.mjs.

## API and pricing
- Reads existing `/api/customers/booking-options/`, room catalogue and hotel availability endpoints. Catalogue photography failure does not block requests. Reads have bounded timeouts.
- POST remains `/api/customers/guest-reservations/`, via the same CSRF-aware customer client. Idempotency key remains stable for an unchanged payload. No estimated price is sent to the server.
- Single/double occupancy adult pricing and server room-allocation rules are preserved. Child count and preferred rooms are explicit special requirements, never independently priced or treated as guaranteed allocations. The user is told to confirm family arrangements and any extra charges with the team.
- Hotel inventory is checked on search. Private stays are explicitly availability-on-request; no private inventory is fabricated. Rooms whose verified count cannot satisfy the adult allocation cannot continue.
- Missing rates require direct contact rather than a zero-price reservation.
- Only a successful response produces a receipt. A real reference is displayed when returned. Receipt wording confirms a request, not a guaranteed booking or payment.
- Company bookings, special requirements, query-prefilled dates/adults/children/preferred rooms and backwards step navigation are retained. Form values stay in React state while changing steps; personal information is not written to local storage.

## Verification and limits
- Run `npm run lint`, `npm test`, `npm run build`, `npm run check:seo`. No typecheck script exists.
- Focused tests cover search prefilling, legacy conference routing, date/calendar edge cases, invalid counts/contact details and invalid rate handling. Existing booking/quote tests remain in place.
- Contrast calculations for core pairings: forest/ivory 8.86:1, forest/white 9.48:1, charcoal/sage 6.98:1, muted text/ivory 6.44:1, active accent/white 6.35:1, forest/mist 7.67:1. These are colour checks, not a complete accessibility certification.
- Responsive styles cover narrow phones through desktop. Chrome/browser access remains blocked by sandbox restrictions documented in HANDOFF; requested viewport screenshots, keyboard interaction, console errors and live API/email end-to-end checks are unverified.
- No Lighthouse or Core Web Vitals scores measured. The live hero relies on gallery API latency; optimized image variants depend on the existing media pipeline.
- Policies, fees, child rates, private-stay inventory, amenities and complete photo galleries need verified API data. No inferred tax, payment method, cancellation or check-in policy was added.
- Room details use existing description and image data, with unknown features referred to the hotel team. No invented amenities or rooms.
- Changes remain uncommitted and undeployed. Browser/live API review is required before production approval.
