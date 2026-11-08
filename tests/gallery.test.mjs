import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
let server;
let Card, Grid, Upload, Carousel, api, staffApi, CustomerContext, Gate, Auth, RequestForm, safeNext, PortalState, Navbar;
const photo = { id: 1, image_url: '/full', thumbnail_url: '/small', title: 'Garden', alt_text: 'A shaded garden path', category: 'garden', description: 'Relax outside' };
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null, ws: false } });
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
  assert.match(html, /Logo%20elparaiso.png/); assert.match(html, /Groups &amp; conferences/); assert.match(html, /My portal/);
});
