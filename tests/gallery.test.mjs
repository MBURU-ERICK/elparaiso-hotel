import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
let server;
let Card, Grid, Upload, Carousel, api, staffApi;
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
  assert.match(html, /name="facility" required/);
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
