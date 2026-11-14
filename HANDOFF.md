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

## Contact numbers
Director: 0724 502 872 (+254724502872). Office: 0708 231 994 (+254708231994).
Both call and WhatsApp destinations are maintained in `src/data/contacts.js`. The floating WhatsApp control offers a labelled choice. Call/WhatsApp connectivity requires testing on a phone; responsive browser review remains blocked by the previously recorded sandbox restriction.

## Multicolour redesign review
See `docs/PREMIUM-REDESIGN.md` for scope, file groups and limitations. New public aliases are prerendered without freezing rates/photos. Events and conferences reuse the existing request form inline, with the relevant service preselected. General contact prepares an email honestly because the legacy enquiry API requires verified authentication. All changes in this phase are left uncommitted and undeployed.

Required owner/browser review before production approval: check all navigation and drawer focus, room details and filters, live rates/images, event/conference submissions and actual email receipts; review 360/390/768/1024/1440/1920px; measure Lighthouse and contrast. No such browser or delivery checks were completed in this restricted environment.

## Compact booking and footer reference pass
Homepage booking now groups adults, children and rooms in a native expandable guest selector, alongside dates and a single action; availability and no-payment reassurance occupy a compact status line. Mobile retains the collapsible booking bar. Footer now has a large invitation, four-column navigation/contact layout and labelled Director/Office call and WhatsApp choices.
Both supplied Dribbble CDN images were inaccessible through the web tool and direct download (DNS failure), so this is an original refinement, not a verified visual match. Attach reference images for a closer art-direction pass. Browser viewport verification remains unavailable under the previously documented Chrome sandbox restriction.

## Navigation, group dining and SEO refinement
- Navigation now owns `components/navigation.css`, uses isolated classes and removes obsolete navigation rules from the guest premium theme. Mobile drawer locks scrolling, cycles focus, closes with Escape/backdrop and restores the toggle focus. Live keyboard/browser review remains required.
- Removed desktop stagger offsets from homepage teaser cards. Consolidated/formatted premium theme rules and extracted restaurant group dining into a dedicated component and stylesheet. Legacy staff and unrelated page styles remain intact; this is not a claim of a complete repository-wide CSS migration.
- Group dining uses live restaurant photography, clear planning steps and existing catering quotation/Director/Office WhatsApp links.
- Added truthful Restaurant and BreadcrumbList JSON-LD, locale and photographic social previews, with output validation. No ratings, opening hours, menu or price claims added.
- The three new Dribbble URLs were inaccessible to the web tool; no exact-reference matching or visual validation is claimed. Browser verification remains blocked by the previously documented environment restrictions. No commits or deployment made.

## Serene booking flow
See `docs/SERENE-BOOKING.md`. Hotel/private stays now use a five-stage request wizard. Verify date search, real API room counts, occupancy changes, comparisons, company details, back navigation, retry/idempotency and actual email acknowledgements on a browser-capable environment before deployment. Child pricing, preferred-room allocations and private-stay availability remain enquiries for hotel confirmation. No backend schema, finance, payment, deployment or email flow changes were made.
