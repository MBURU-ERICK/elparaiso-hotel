# Homepage handoff

## Hotel content and decisions
- Add approved, attributable guest reviews, with publication permission. The homepage currently has an explicitly labelled testimonial placeholder; no ratings are claimed.
- Confirm any additional direct-booking perks before advertising them. No breakfast, best-rate promise or payment method is claimed.
- Confirm the exact Google Maps business pin and final-approach instructions. Directions currently open Google Maps searches from Nyahururu, Nanyuki and Nairobi; journey times are left to live routing.
- Upload a suitable wide hero photograph in the existing gallery's `general` category. The first returned image is used live. Restaurant and experiences cards use their respective gallery categories; conference uses `general` because the gallery has no conference category.
- Supply responsive AVIF/WebP variants through the existing image pipeline. The frontend uses supplied thumbnails and originals; it cannot manufacture optimized formats through URL guessing.
- Confirm the phone number supports WhatsApp: the requested link uses the supplied +254 708 231 994 contact.

## Editing and behavior
- Room categories/rates/images remain managed in the existing hotel system (`/api/rooms/types/`). Private stays use `/api/shortstays/units/`. Nothing is snapshotted at build time.
- Gallery content remains managed by the existing gallery tools. Homepage editorial copy and directions origins are in `src/data/home.js`; homepage layout is in `src/pages/Home.jsx`.
- Homepage public catalogue data is cached in memory, refreshed every minute and on window focus/reconnection. Failures retain previous data and offer retry/contact options. Availability is fetched separately for the selected dates and remains provisional.
- Booking links carry check_in, check_out, adults, children and rooms. The existing booking form receives dates/adults; requested children/room counts are prefilled into editable requirements. The backend still calculates room allocation and prices; no API/email contract changes were made.
- Analytics integrations can listen for `hotel:analytics` custom events (`booking-start`, `whatsapp-click`). No third-party tracking was added.

## Verification limits
- No typecheck script is defined in package.json (this is a JavaScript project).
- Browser checks at 375, 768 and 1440 pixels were attempted but blocked by sandbox socket restrictions when launching Chrome and connecting to its local debugging endpoint. Visual appearance, overflow, runtime console and end-to-end live API integration remain unverified.
- No Lighthouse scores were measured. Hero preload becomes available after the live gallery response; reaching the LCP target needs a measured production test and a fast image API/CDN response.
- Rooms pages have not been redesigned in this task.

## Homepage visual refinement
- Added an editorial welcome section, refined system-font typography, staggered experience imagery, open room-card layouts, and a forest-green discovery section. No external fonts or animation libraries added.
- On phones, featured stays use native horizontal scrolling; booking controls start collapsed and can be expanded from the hero action. Desktop booking fields remain expanded.
- Retried a 375px Chrome screenshot using a writable temporary profile; Chrome failed with `setsockopt: Operation not permitted`. All three requested viewport reviews, screenshot inspection, runtime console and production Lighthouse remain pending in a browser-capable environment.
