# Customer portal and website design update

The existing React/Vite application now has a customer workspace at /account, separate from the staff workspace. The supplied public/images/Logo elparaiso.png appears in the main navigation, footer, sign-in screen and invoice view. Source logo files are preserved.

## Guest journey
- Public accommodation, dining, gallery, contact and Groups & conferences (/business) pages remain accessible.
- Book Your Stay leads to /booking. Unauthenticated customers are redirected to /account/login with a validated return path; Airbnb submissions follow the same login requirement.
- Registration records name, company, phone and email. Customers verify their email before submitting requests/bookings; forgotten passwords use expiring single-use email links.
- /account shows recent booking requests and task cards. Customers can edit contact/company details in /account/profile.
- /account/requests/new supports group accommodation, conference/meeting, combined stays, dining/catering and general service requests. Customers provide facility, dates, guest/room count and a brief.
- Requests show status, quotation scope/amount and a paginated conversation. Updates queue an email, reducing dependence on WhatsApp.
- /account/invoices lists private invoice snapshots. Customers can acknowledge details or report a discrepancy once and download a branded, self-contained printable HTML document. Open the download and use the browser Print menu to save PDF. A native server-generated PDF is not included.
- A company name does not grant colleagues access: requests and invoices belong to the customer account that submitted them. Existing bookings are not claimed automatically by matching an email address.

## Staff journey
/staff/customers is visible to facility managers. Staff see only requests/invoices for facilities they manage. They can view customer contact details, reply, prepare scope/pricing, issue a line-item invoice and void an invoice while retaining its record. Issued amounts are calculated by the server. A request can have only one active invoice through the locked issuance workflow; voiding permits a replacement. All invoice and request links are authorized again at the API, independently of navigation.

## SEO and performance
The build now splits staff/customer/booking pages into separate bundles. Main JavaScript is approximately 327 KB raw (about 102 KB gzip), compared with approximately 369 KB raw before this update. This is a bundle measurement, not a measured Core Web Vitals or ranking result. The supplied original logo is approximately 528 KB; a separately verified asset optimization remains worthwhile.

Eight public pages are prerendered with visible page content, distinct titles, descriptions, canonical links and social preview metadata. Home includes factual Hotel JSON-LD. React hydrates the public HTML; customer and staff content is excluded from prerendering. Vercel routing maps each public route to its generated document; private and unknown routes use an empty app shell to avoid hydrating homepage markup on a different route. Private paths have noindex response headers and component metadata; authorization still belongs to the backend. VITE_SITE_URL controls generated canonicals/social URLs; update sitemap.xml and robots.txt when changing the canonical domain.

Prerendering provides initial public HTML for crawlers and users, while live gallery data loads in the browser. No search position, rich result, Lighthouse score or real-device speed result is promised. Google references: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics and https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading .

## Verification and rollout gates
- npm test: 13 component-render/service tests pass, including customer gate, safe return paths, signup/request fields, logo/navigation and gallery regressions.
- npm run lint: passes.
- npm run build: builds and prerenders eight public routes.
- npm run check:seo: verifies generated metadata/content and excludes customer/staff prerendering.
- Browser interaction, hydration, real mobile layouts, screen-reader/contrast, real Vercel routing/headers and Google Search Console validation still require staging.
- Backend migration, production email transport, scheduled dispatcher and real-domain cookie tests must be completed before the mandatory login/verification flow is deployed. No production deployment occurred.

Primary files: src/customer/*; src/pages/Business.jsx; src/styles/customer.css; navigation/footer/SEO; App.jsx and main.jsx; booking/short-stay services; public-page enquiry actions; scripts/prerender.mjs; scripts/check-public-pages.mjs; vercel.json; tests/gallery.test.mjs.
