# Elparaiso website improvement and verification

14 November 2026. Changes made directly in the existing frontend checkout. No deployment, DNS changes, backend edits, production enquiry submissions, or financial/M-Pesa/accounting changes.

## Findings verified

| Review finding | Evidence and outcome |
| --- | --- |
| Booking appeared blank to a checker | Production Chrome renders the five-step stay wizard. The deployment previously served an empty app shell for `/booking`, explaining why a non-JavaScript checker could miss it. The initial booking screen is now prerendered, with its existing noindex policy preserved. |
| Rooms showed loading placeholders | Production Chrome loads four categories; the public API returns real prices, capacities, amenities and image URLs. No production catalogue outage was reproduced. Local `.env.local` referenced an obsolete Vercel backend and has been corrected to the supplied production API. |
| Homepage testimonial placeholder | Confirmed in source and removed without inventing reviews. |
| Contact prepares email | Confirmed and preserved truthfully. The backend's `enquiries/views.py` requires `IsVerifiedCustomer` and session authentication, so this is not a public enquiry endpoint. The public contact form cannot simply POST there. Existing public accommodation/event/conference requests continue through their supported endpoint. |
| About needs stronger storytelling | Existing editorial layout retained and expanded from three to five photographic chapters, adding private stays and meetings/celebrations without inventing history. |
| Facility imagery needs improvement | Published gallery records 13 and 15 identify the real conference and wedding setups. These now lead the conference/events pages and the relevant homepage/service links. |
| Cached photographs can stay blurred | Initial HTML photographs can finish loading before hydration installs `onLoad`. The image ref now detects an already complete image and reveals it. |
| Events semantics and loading layout | Fixed duplicate H1 and missing main landmark; fixed a loading-grid overflow found at 1024px. |
| Domain/canonical behavior | Live HTTPS non-www responds 308 to `https://www.elparaisohotelltd.com/`, which responds 200. Canonical URLs use www. No DNS or redirect infrastructure changed. |

## Implemented improvements

- Retained the requested eight-color design tokens and strengthened shared editorial layout, accessible focus styling, form sizing, room amenity chips, footer contrast and reduced-motion handling.
- Real hotel photographs now exist in initial HTML instead of waiting for gallery JavaScript before displaying any photography. Live gallery data remains preferred for existing categories. Dedicated facility photographs use verified published gallery records; no stock or generated hotel imagery was added.
- Accommodation remains API-driven. Both array and paginated catalogue responses are supported; malformed responses fail into the existing retry state. Explicit booking links and room amenities improve the cards. Missing double-occupancy prices display “Rate on request” instead of substituting an unsupported single rate.
- The existing date → accommodation → guest details → review → API acknowledgement journey is preserved. Booking uses actual room/availability data and clearly describes a request for a quotation, not a confirmed reservation or payment.
- Public booking/content requests now have bounded network waits; CSRF preparation remains credentialed. New deadlines are scoped to public hospitality endpoints, preserving staff/account request behavior. Submission timeout copy explains that receipt could not be verified; the existing idempotency key survives retries.
- Contact has a prominent direct-booking/event pathway alongside its accurately labelled email-preparation form and phone/WhatsApp/directions cards.
- Events and conferences have image-led facility stories, genuine facility captions and clear requirements to confirm layout, capacity, equipment and services with the team.
- The navigation assistant is labelled “Hotel guide”, matching its actual function.
- Added API preconnection, retained eager hero/lazy secondary photography, and deferred the admin dashboard bundle until its route is used.
- Booking output and removal of the testimonial placeholder are now checked by the SEO verification script.

## Pages reviewed

`/`, `/rooms`, `/booking`, `/private-stays`, `/restaurant`, `/experiences`, `/events-groups`, `/conferences`, `/about`, `/contact`, `/gallery`.

Homepage, rooms, booking, About, Contact, Events & Groups and Conferences received direct content/component improvements. Other guest pages benefit from the shared photography, accessibility and design changes. Existing routes and legacy aliases remain available.

## Integration verification

- Live GET `/api/rooms/types/`: four categories, real rates, capacities, amenities and photographs.
- Live GET `/api/customers/booking-options/`: rooms, facilities, private units, conference packages and event options.
- Live gallery catalogue: twelve published photographs, including actual meeting/celebration spaces.
- Browser booking search successfully retrieves real accommodation choices through the availability integration; selecting a room advances through guest details to review with an estimated quotation.
- Existing submission contract remains POST `/api/customers/guest-reservations/`, credentialed CSRF preparation, and the same idempotency key behavior. Unit tests verify the request contract using mocks. No real booking was submitted; production acknowledgement, email delivery and server persistence are not claimed as tested end to end.
- Contact telephone/email/WhatsApp links and garden gallery filtering verified in Chrome. Contact continues to require the guest to press Send in their email app.

## Validation

- `npm run build`: passed; 15 initial route documents generated. `/booking` now contains real initial form content and canonical/noindex metadata. Account and staff data are not prerendered.
- `npm run lint`: passed.
- `npm test`: passed: 43 component/service tests plus the stay-date suite. New tests cover array/paginated/malformed/error catalogue responses and bounded, credentialed CSRF submission requests.
- `npm run check:seo`: passed. Titles, descriptions, canonical URLs, visible headings, Hotel/Restaurant/Breadcrumb structured data and booking output verified.
- `git diff --check`: passed.
- Chrome route/layout matrix: all eleven requested routes inspected at 360, 390, 768, 1024 and 1440px. A completed built-site pass reported no horizontal overflow, one H1 and a main landmark on all 55 combinations, with no runtime exceptions. The final matrix also covered all 55 combinations. One transient 768px rooms flag was rechecked after the catalogue settled: no element extended beyond the viewport. Final image checks reported no broken photographs or loaded images stuck in the hidden state; direct inspection confirmed the hero and room photographs were complete and visible.
- Interaction checks: required guest fields reject an empty form; valid test details reach review without submitting; mobile menu Escape restores toggle focus; four room cards expose booking actions and API amenities; contact actions and gallery category selection work.
- Desktop/mobile full-page screenshots collected for homepage, About, booking, conferences and contact. Local QA artifacts are in `/tmp/elparaiso-final-*.png`; logs are in `/tmp/elparaiso-*-qa.log`, `/tmp/elparaiso-final-matrix.log` and `/tmp/elparaiso-improvement-*.log`.

Browser methodology: production `/booking` and `/rooms` were inspected directly. The built local frontend was also served through Chrome request interception under the intended website origin; API reads remained live and unchanged. This permits realistic production-origin API/CORS checks without uploading or deploying local files. A plain localhost frontend cannot read the production API because production CORS excludes localhost. Use a local backend/CORS configuration for ordinary local development; no production security policy was weakened for testing.

## Remaining limits and deployment readiness

The frontend builds and passes its automated checks. It is ready for review and a controlled deployment, not yet deployed.

Before publishing, ensure the deployment's `VITE_API_URL` is `https://api.elparaisohotelltd.com`; the local ignored env change does not update hosting environment settings. Review screenshots with the hotel team. Public contact submission still needs a deliberately supported anonymous backend endpoint if email-app preparation is to be replaced. Live submission acknowledgement and email delivery need a controlled end-to-end check with the hotel team. No field Core Web Vitals or Lighthouse scores are asserted; the site still has a sizeable shared stylesheet and third-party fonts/maps. Some backend room descriptions are empty and would benefit from hotel-approved copy. Published photograph URLs remain dependent on the hotel's media service and should be updated if those records are retired.

## Files changed

- `index.html`: theme and API preconnection.
- `vercel.json`, `scripts/prerender.mjs`: initial booking document and route rewrite.
- `scripts/check-public-pages.mjs`: booking/placeholder regression assertions.
- `src/App.jsx`: lazy admin dashboard loading.
- `src/components/HomeLive.jsx`: initial verified photography and cached-image readiness handling.
- `src/components/StayExplorer.jsx`: guest query, room details/amenities/actions, failed photograph state and truthful double rates.
- `src/components/HelpChat.jsx`: guide label.
- `src/customer/customerApi.js`: public request deadlines.
- `src/services/bookingApi.js`: catalogue envelope/error handling.
- `src/hooks/useGallery.js`: keep the internal request key out of gallery component props, resolving a React development warning.
- `src/data/photography.js`: verified published hotel photograph selections.
- `src/data/aboutStory.js`, `src/data/home.js`, `src/data/services.js`: added storytelling and correct facility imagery/links.
- `src/pages/Home.jsx`: removed testimonial placeholder.
- `src/pages/StayBooking.jsx`: room amenities and uncertain-submission timeout copy.
- `src/pages/Events.jsx`, `src/pages/Business.jsx`: facility stories and Events semantics.
- `src/pages/Contact.jsx`: direct enquiry pathways and form labelling.
- `src/styles/serene.css`: shared editorial, contact, room, accessibility and responsive styles.
- `tests/gallery.test.mjs`: public API/CSRF regressions.
- `.env.local` (ignored): corrected the obsolete API origin; unrelated settings preserved.
- `docs/production-improvement-report.md`: this report.
