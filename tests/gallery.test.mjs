import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { todayInNairobi } from '../src/utils/stayDates.js';
import { hotelFacilities, defaultHotelFacility } from '../src/utils/hotelFacilities.js';
import { validateRoomPhotos } from '../src/utils/roomPhotos.js';
import { estimateBooking } from '../src/utils/bookingQuote.js';
import { HelmetProvider } from 'react-helmet-async';
let server;
let EventCarousel, EventDetailsDialog, StaffContent, PhotoPicker, ReservationCard, photoApi, GuestReview, GuestBooking, Card, Grid, Upload, Carousel, api, staffApi, CustomerContext, Gate, Auth, RequestForm, safeNext, PortalState, Navbar, CustomerNav, Booking, RoomFilters, FavouriteRoom, ProfileForm;
const photo = { id: 1, image_url: '/full', thumbnail_url: '/small', title: 'Garden', alt_text: 'A shaded garden path', category: 'garden', description: 'Relax outside' };
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null, ws: false } });
  ({ RoomFilters, FavouriteRoom } = await server.ssrLoadModule('/src/components/RoomPreferences.jsx'));
  EventCarousel = (await server.ssrLoadModule('/src/components/EventCarousel.jsx')).default;
  EventDetailsDialog = (await server.ssrLoadModule('/src/components/EventDetailsDialog.jsx')).default;
  StaffContent = (await server.ssrLoadModule('/src/pages/StaffContent.jsx')).default;
  PhotoPicker = (await server.ssrLoadModule('/src/components/RoomPhotoPicker.jsx')).default;
  ReservationCard = (await server.ssrLoadModule('/src/components/StaffReservationCard.jsx')).default;
  photoApi = (await server.ssrLoadModule('/src/services/airbnbPhotos.js')).airbnbPhotos;
  GuestReview = (await server.ssrLoadModule('/src/pages/GuestReview.jsx')).default;
  GuestBooking = (await server.ssrLoadModule('/src/pages/GuestBooking.jsx')).default;
  ProfileForm = (await server.ssrLoadModule('/src/customer/CustomerProfileForm.jsx')).default;
  CustomerNav = (await server.ssrLoadModule('/src/customer/CustomerNav.jsx')).default;
  Booking = (await server.ssrLoadModule('/src/pages/Booking.jsx')).default;
  Card = (await server.ssrLoadModule('/src/components/GalleryCard.jsx')).default;
  Grid = (await server.ssrLoadModule('/src/components/GalleryGrid.jsx')).default;
  Upload = (await server.ssrLoadModule('/src/components/GalleryUploadForm.jsx')).default;
  Carousel = (await server.ssrLoadModule('/src/components/GalleryCarousel.jsx')).GalleryCarouselView;
  api = (await server.ssrLoadModule('/src/services/galleryApi.js')).galleryApi;
  staffApi = (await server.ssrLoadModule('/src/services/staffApi.js')).staffApi;
  CustomerContext = (await server.ssrLoadModule('/src/customer/context.js')).CustomerContext;
  Gate = (await server.ssrLoadModule('/src/customer/CustomerGate.jsx')).default;
  Auth = (await server.ssrLoadModule('/src/customer/CustomerAuth.jsx')).default;
  RequestForm = (await server.ssrLoadModule('/src/customer/RequestForm.jsx')).default;
  safeNext = (await server.ssrLoadModule('/src/customer/customerApi.js')).safeNext;
  PortalState = (await server.ssrLoadModule('/src/customer/PortalParts.jsx')).PortalState;
  Navbar = (await server.ssrLoadModule('/src/components/Navbar.jsx')).default;
});
after(async () => { await server?.close(); });
test('gallery cards use meaningful alt text, responsive sources and lazy loading', () => {
  const html = render(Card, { image: photo });
  assert.match(html, /alt="A shaded garden path"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /srcSet="\/small 640w, \/full 1920w"/);
  assert.match(html, /Relax outside/);
});
test('gallery has distinct loading, error and empty states', () => {
  assert.match(render(Grid, { loading: true }), /role="status"/);
  assert.match(render(Grid, { error: 'Offline' }), /role="alert"/);
  assert.match(render(Grid, { error: 'Offline' }), /Try again/);
  assert.match(render(Grid, { images: [] }), /Photographs are being prepared/);
  assert.match(render(Grid, { images: [photo] }), /Garden/);
});
test('upload form labels metadata, defaults to private and limits accepted files', () => {
  const html = render(Upload, { facilities: [{ id: 1, name: 'Hotel' }] });
  assert.match(html, /Image description for accessibility/);
  assert.match(html, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(html, /name="facility"[^>]*required/);
  assert.doesNotMatch(html, /checked/);
  assert.match(html, /maxLength="300" required="" name="alt_text"/);
});
test('carousel renders accessible controls and gives first image loading priority', () => {
  const html = render(Carousel, { images: [photo, { ...photo, id: 2 }] });
  assert.match(html, /aria-roledescription="carousel"/);
  assert.match(html, /Previous photograph/);
  assert.match(html, /Next photograph/);
  assert.match(html, /Pause slideshow/);
  assert.match(html, /loading="eager" fetchPriority="high"/);
  assert.match(html, /loading="lazy" fetchPriority="auto"/);
  assert.match(html, /hidden=""/);
});
test('carousel shows a branded empty state and no controls for a single image', () => {
  assert.match(render(Carousel, { images: [] }), /Welcome to Elparaiso/);
  assert.doesNotMatch(render(Carousel, { images: [photo] }), /Next photograph/);
});
test('public gallery encodes category, featured and page filters and reports errors', async () => {
  const original = globalThis.fetch;
  try {
    let requested;
    globalThis.fetch = async url => { requested = url; return { ok: true, json: async () => ({ results: [photo], count: 1 }) }; };
    const result = await api.list({ category: 'garden', featured: true, page: 2 });
    assert.match(requested, /page=2&category=garden&featured=true/);
    assert.equal(result.results[0].id, 1);
    globalThis.fetch = async () => ({ ok: false });
    await assert.rejects(api.list(), /could not load the gallery/);
  } finally { globalThis.fetch = original; }
});
test('staff multipart uploads preserve browser boundaries and send session CSRF token', async () => {
  const original = globalThis.fetch;
  try {
    const requests = [];
    globalThis.fetch = async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ csrfToken: 'masked-token' }) }; };
    const form = new FormData(); form.set('title', 'Garden');
    await api.upload(form);
    const upload = requests.at(-1).options;
    assert.equal(upload.body, form);
    assert.equal(upload.credentials, 'include');
    assert.equal(upload.headers['X-CSRFToken'], 'masked-token');
    assert.equal(upload.headers['Content-Type'], undefined);
    await staffApi.logout();
  } finally { globalThis.fetch = original; }
});

function portalRender(Component, props = {}, user = { name: 'Alice', email: 'alice@example.test', company: 'Acme', verified: true }, location = '/account') {
  return renderToStaticMarkup(React.createElement(HelmetProvider, {}, React.createElement(MemoryRouter, { initialEntries: [location] }, React.createElement(CustomerContext, { value: { user, loading: false, error: '', refresh() {} } }, React.createElement(Component, props)))));
}
test('customer redirect destinations stay within portal and booking routes', () => {
  for (const value of ['https://evil.test', '//evil.test', '/account/../../outside', '/staff/dashboard', 'javascript:alert(1)', '/account\\evil']) assert.equal(safeNext(value), '/account');
  assert.equal(safeNext('/booking?room=2'), '/booking?room=2');
  assert.equal(safeNext('/account/requests/new'), '/account/requests/new');
});
test('unverified customers cannot see protected service forms', () => {
  const html = portalRender(Gate, { children: React.createElement('div', {}, 'private booking') }, { email: 'alice@example.test', verified: false });
  assert.match(html, /Verify your email/); assert.doesNotMatch(html, /private booking/);
});
test('verified customer gate renders its protected content', () => {
  assert.match(portalRender(Gate, { children: React.createElement('div', {}, 'private booking') }), /private booking/);
});
test('customer registration form labels company and secure account fields', () => {
  const html = portalRender(Auth, { mode: 'register' });
  assert.match(html, /Company \/ organisation/); assert.match(html, /autoComplete="new-password"/); assert.match(html, /type="email"/); assert.match(html, /Create account/);
});
test('conference request form collects capacity dates facility and requirements', () => {
  const html = portalRender(RequestForm, {}, undefined, '/account/requests/new?service=conference');
  assert.match(html, /Conference \/ meeting/); assert.match(html, /Number of guests/); assert.match(html, /name="requirements"/); assert.match(html, /name="facility"[^>]*required/); assert.match(html, /does not reserve rooms/);
});
test('portal error and empty states are explicit and navigation uses the supplied logo', () => {
  assert.match(render(PortalState, { error: 'Offline' }), /role="alert"/);
  assert.match(render(PortalState, { empty: true }), /Nothing here yet/);
  const html = portalRender(Navbar);
  assert.match(html, /Logo%20elparaiso.png/); assert.match(html, /Events &amp; Groups/); assert.match(html, /Private Stays/); assert.doesNotMatch(html, /My portal|href="\/account/);
});

test('guest navigation stays available on booking and private-stay routes', () => {
  for (const path of ['/booking', '/airbnb', '/account/requests']) {
    const html = portalRender(CustomerNav, {}, undefined, path);
    for (const label of ['Overview', 'Book a room', 'Requests', 'Invoices', 'Profile', 'Sign out']) assert.ok(html.includes(label));
    assert.match(html, /aria-label="Your guest account"/);
  }
});
test('booking preserves dates and guest count selected while browsing', () => {
  const html = portalRender(Booking, {}, undefined, '/booking?check_in=2026-12-10&check_out=2026-12-12&adults=2');
  assert.match(html, /value="2026-12-10"/); assert.match(html, /value="2026-12-12"/);
  assert.match(html, /value="2" selected=""/); assert.match(html, /Explore all stays/);
});

test('booking calendar prevents past check-in and requires checkout after check-in', () => {
  const html = portalRender(Booking, {}, undefined, '/booking?check_in=2099-12-30&check_out=2099-12-31');
  const inputs = html.match(/<input[^>]*>/g);
  assert.match(inputs.find(input => input.includes('name="check_in"')), /min="[0-9]{4}-[0-9]{2}-[0-9]{2}"/);
  assert.match(inputs.find(input => input.includes('name="check_out"')), /min="2099-12-31"/);
});
test('room preferences expose classification filtering and accessible saved state', () => {
  const preferences = { classification: '', onlyFavourites: true, ids: [3], pending: null, error: '', toggle() {}, setClassification() {}, setOnlyFavourites() {} };
  const html = render(RoomFilters, { rooms: [{ id: 3, name: 'Deluxe' }, { id: 4, name: 'Standard' }], preferences });
  assert.match(html, /Room classification/); assert.match(html, /Deluxe/); assert.match(html, /Standard/); assert.match(html, /Favourites \(1\)/);
  const heart = render(FavouriteRoom, { room: { id: 3, name: 'Deluxe' }, preferences });
  assert.match(heart, /aria-pressed="true"/); assert.match(heart, /Remove Deluxe from favourites/);
});
test('profile collects an optional billing KRA PIN', () => {
  const html = portalRender(ProfileForm);
  assert.match(html, /KRA PIN \(for invoicing\)/); assert.match(html, /name="kra_pin"/); assert.match(html, /future invoices/);
});

test('public booking works without a customer provider and requests guest contact details', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/booking?check_in=2027-01-02&check_out=2027-01-04&adults=2'] }, React.createElement(GuestBooking)));
  for (const field of ['name', 'email', 'phone', 'guests', 'start_date', 'end_date', 'facility']) assert.ok(html.includes(`name="${field}"`));
  assert.match(html, /No account needed/);
  assert.match(html, /value="2027-01-02"/);
  assert.match(html, /value="2027-01-04"/);
  assert.doesNotMatch(html, /password|Sign in/);
});

const quoteOptions = {
  rooms: [{ id: 1, facility: 1, name: 'Deluxe', nightly_rate: '3000.00', double_occupancy_rate: '4500.00', max_occupancy: 2 }],
  packages: [{ id: 2, facility: 1, duration: 'full', price_per_guest: '2500.00' }],
  units: [{ id: 3, facility: 1, name: 'Garden suite', nightly_rate: '5000.00', max_guests: 4 }],
};
const quoteForm = { service: 'conference', facility: '1', package: '2', room_type: '1', unit: '3', guests: '10', occupancy: '1', start_date: '2027-01-02', end_date: '2027-01-02' };
test('conference estimate shows 10 full-day guests at 2500 as 25000', () => {
  const quote = estimateBooking(quoteForm, quoteOptions);
  assert.equal(quote.total, '25000.00');
  assert.equal(quote.lines[0].quantity, 10);
});
test('hotel estimates use occupancy, room counts and nights including an odd guest count', () => {
  const form = { ...quoteForm, service: 'hotel', guests: '3', occupancy: '2', end_date: '2027-01-04' };
  const quote = estimateBooking(form, quoteOptions);
  assert.equal(quote.total, '18000.00');
  assert.equal(quote.lines[0].quantity, 4);
  assert.match(quote.lines[0].basis, /2 rooms × 2 nights/);
  assert.equal(estimateBooking({ ...form, occupancy: '1' }, quoteOptions).total, '18000.00');
});
test('optional conference accommodation is itemized separately from attendee pricing', () => {
  const quote = estimateBooking({ ...quoteForm, add_accommodation: true, accommodation_guests: '4', occupancy: '2', accommodation_check_in: '2027-01-02', accommodation_check_out: '2027-01-03' }, quoteOptions);
  assert.equal(quote.total, '34000.00');
  assert.equal(quote.lines.length, 2);
  assert.equal(estimateBooking({ ...quoteForm, add_accommodation: false }, quoteOptions).lines.length, 1);
});
test('invalid capacity and unconfigured double occupancy cannot produce an estimate', () => {
  assert.equal(estimateBooking({ ...quoteForm, service: 'airbnb', guests: '5', end_date: '2027-01-04' }, quoteOptions), null);
  assert.equal(estimateBooking({ ...quoteForm, service: 'hotel', occupancy: '2', end_date: '2027-01-04' }, { ...quoteOptions, rooms: [{ ...quoteOptions.rooms[0], double_occupancy_rate: null }] }), null);
});
test('the public review page without a personal invitation does not display a review form', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/review'] }, React.createElement(GuestReview)));
  assert.match(html, /Reviews open after checkout/);
  assert.doesNotMatch(html, /name="comment"|name="rating"/);
});

test('room photo picker offers direct device uploads with multiple photos and accepted types', () => {
  const html = render(PhotoPicker, { files: [], onChange() {} });
  assert.match(html, /type="file"/);
  assert.match(html, /multiple=""/);
  assert.match(html, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(html, /Browse photos/);
  assert.doesNotMatch(render(PhotoPicker, { files: [], multiple: false, onChange() {} }), /multiple=""/);
});
test('room photo validation rejects unsupported formats, oversized files and excess photos', () => {
  const valid = { name: 'room.jpg', type: 'image/jpeg', size: 1000 };
  assert.equal(validateRoomPhotos([valid], 1), '');
  assert.match(validateRoomPhotos([{ ...valid, type: 'image/svg+xml' }]), /JPEG, PNG or WebP/);
  assert.match(validateRoomPhotos([{ ...valid, size: 9 * 1024 * 1024 }]), /8 MiB/);
  assert.match(validateRoomPhotos([valid, valid], 1), /at most 1 more/);
});
test('direct Airbnb photo requests preserve multipart boundaries and room identity', async () => {
  const original = globalThis.fetch;
  try {
    const requests = [];
    globalThis.fetch = async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ csrfToken: 'photo-csrf' }) }; };
    await photoApi.upload(42, new Blob(['image bytes'], { type: 'image/jpeg' }), 'Room 42');
    const request = requests.at(-1);
    assert.match(request.url, /units\/42\/photos\/$/);
    assert.ok(request.options.body instanceof FormData);
    assert.equal(request.options.body.get('alt_text'), 'Room 42');
    assert.equal(request.options.headers['Content-Type'], undefined);
    assert.equal(request.options.headers['X-CSRFToken'], 'photo-csrf');
    assert.equal(request.options.credentials, 'include');
    await staffApi.logout();
  } finally { globalThis.fetch = original; }
});
test('reservation cards keep stay details and actions without treating unavailable amounts as zero', () => {
  const html = render(ReservationCard, { booking: { id: 7, reference: 'HOTEL-7', guest_name: 'Guest Seven', status: 'confirmed', room: '101', check_in: '2027-01-02', check_out: '2027-01-03', total_amount: null }, children: React.createElement('button', {}, 'Check in') });
  assert.match(html, /Guest Seven/); assert.match(html, /2027-01-02/); assert.match(html, /Check in/);
  assert.match(html, /Not available/); assert.doesNotMatch(html, /KES 0/);
});

test('a missing photo-upload endpoint explains recovery and preserves the 404 status', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async url => String(url).endsWith('/csrf/')
      ? { ok: true, json: async () => ({ csrfToken: 'photo-csrf' }) }
      : { ok: false, status: 404, json: async () => ({}) };
    await assert.rejects(photoApi.upload(42, new Blob(['image'], { type: 'image/jpeg' }), 'Room 42'), error => {
      assert.equal(error.status, 404);
      assert.match(error.message, /update and restart the backend/);
      return true;
    });
  } finally { globalThis.fetch = original; }
});

test('hotel facility selection uses the Elparaiso name rather than assuming facility 1', () => {
  const facilities = [{ id: 1, name: 'Private stays', facility_type: 'airbnb' }, { id: 37, name: 'Elparaiso Hotel', facility_type: 'hotel' }, { id: 9, name: 'Other hotel', facility_type: 'hotel' }];
  assert.equal(defaultHotelFacility(facilities), '37');
  assert.deepEqual(hotelFacilities(facilities).map(f => f.name), ['Elparaiso Hotel', 'Other hotel']);
  assert.equal(defaultHotelFacility([{ id: 42, name: 'One hotel', facility_type: 'hotel' }]), '42');
  assert.equal(defaultHotelFacility([{ id: 1, name: 'Private stay', facility_type: 'airbnb' }]), '');
});

test('event form prevents past dates while keeping dates optional', () => {
  const form = React.createElement(StaffContent, { kind: 'events' });
  const app = React.createElement(MemoryRouter, null,
    React.createElement(Routes, null,
      React.createElement(Route, { element: React.createElement(Outlet, { context: { user: { is_superuser: true } } }) },
        React.createElement(Route, { index: true, element: form }))));
  const html = renderToStaticMarkup(app);
  for (const name of ['start_date', 'end_date']) {
    const input = html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0];
    assert.ok(input);
    assert.match(input, /type="date"/);
    assert.ok(input.includes(`min="${todayInNairobi()}"`));
    assert.doesNotMatch(input, /required/);
  }
});

test('event booking has a dedicated form without requiring a conference package', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/booking?service=event'] }, React.createElement(GuestBooking)));
  assert.match(html, /Event \/ celebration/);
  assert.match(html, /name="event_type"/);
  assert.match(html, /name="event_name"/);
  assert.match(html, /name="event"/);
  assert.match(html, /Send event booking request/);
  assert.match(html, /tailored quotation/);
  assert.doesNotMatch(html, /name="package"/);
  assert.doesNotMatch(html, /Total estimate/);
});
test('event bookings use a staff quotation rather than a zero-priced conference estimate', () => {
  assert.equal(estimateBooking({ service: 'event', guests: '20' }, {}), null);
});

const eventPoster = { id: 17, title: 'Garden celebration', type_name: 'Celebration', image: '/poster.webp', start_date: '2026-12-20', end_date: '2026-12-21', description: 'Live music and dinner.\nAll are welcome.' };
test('event carousel uses compact room-style cards, image buttons and event-specific bookings', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(EventCarousel, { events: [eventPoster, { ...eventPoster, id: 18, title: 'Team retreat' }] })));
  assert.match(html, /aria-roledescription="carousel"/);
  assert.match(html, /stay-listing event-listing/);
  assert.match(html, /View Garden celebration image and details/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /Previous events/);
  assert.match(html, /Next events/);
  assert.match(html, /service=event&amp;event=17/);
  assert.match(html, /aria-roledescription="slide"/);
});
test('a single event keeps its card and hides unnecessary carousel controls', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(EventCarousel, { events: [eventPoster] })));
  assert.match(html, /event-listing/);
  assert.doesNotMatch(html, /Previous events|Next events/);
  assert.equal(render(EventCarousel, { events: [] }), '');
});
test('event details include the full image, unabridged description and booking action', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(EventDetailsDialog, { event: eventPoster, onDismiss() {} })));
  assert.match(html, /<dialog/);
  assert.match(html, /aria-labelledby=/);
  assert.match(html, /Close event details/);
  assert.match(html, /src="\/poster.webp"/);
  assert.match(html, /All are welcome/);
  assert.match(html, /Open full image in a new tab/);
  assert.match(html, /service=event&amp;event=17/);
});

test('linked reservation cards use one traceable reference and the unified booking controls', () => {
  const booking = { id: 9, request_id: 42, booking_code: 'ELP-PVT-UNIQUE', status: 'confirmed', guest_name: 'Guest', unit_name: 'Garden suite', check_in: '2026-12-20', check_out: '2026-12-22', guests: 2, total_amount: '10000.00' };
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ReservationCard, { booking, airbnb: true }, React.createElement('button', null, 'Cancel standalone reservation'))));
  assert.match(html, /ELP-PVT-UNIQUE/);
  assert.match(html, /staff\/guest-reservations\?request=42/);
  assert.match(html, /Manage website booking/);
  assert.doesNotMatch(html, /Cancel standalone reservation/);
});

test('embedded event request uses the existing form with an event preset and section heading', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/events-groups'] }, React.createElement(GuestBooking, { initialService: 'event', embedded: true })));
  assert.match(html, /<section class="section booking-page"/);
  assert.match(html, /<h2>Let’s plan your visit/);
  assert.match(html, /option value="event" selected/);
  assert.match(html, /name="event_name"/);
  assert.doesNotMatch(html, /<main/);
});
test('embedded conference enquiry starts in organisation mode without changing the booking contract', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/conferences'] }, React.createElement(GuestBooking, { initialService: 'conference', embedded: true, companyMode: true })));
  assert.match(html, /option value="conference" selected/);
  assert.match(html, /name="company"/);
  assert.match(html, /name="package"/);
  assert.match(html, /name="requirements"/);
});
