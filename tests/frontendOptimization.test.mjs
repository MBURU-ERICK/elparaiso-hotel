import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicResourceCache } from '../src/utils/publicResourceCache.js';
import { unitPhotos } from '../src/utils/privateStays.js';
import { routeAssetTags } from '../scripts/prerender-assets.mjs';

test('public catalogue consumers share an in-flight request and fresh results', async () => {
  let time = 0, calls = 0, updates = 0;
  const cache = createPublicResourceCache({ now: () => time, maxAge: 60000 });
  const stopA = cache.subscribe('rooms', () => updates++);
  const stopB = cache.subscribe('rooms', () => updates++);
  const loader = async () => { calls++; return [{ id: calls }]; };
  await Promise.all([cache.load('rooms', loader), cache.load('rooms', loader)]);
  assert.equal(calls, 1); assert.equal(updates, 2);
  await cache.load('rooms', loader);
  assert.equal(calls, 1);
  time = 60001;
  await cache.load('rooms', loader);
  assert.equal(calls, 2);
  assert.deepEqual(cache.getSnapshot('rooms').data, [{ id: 2 }]);
  stopA(); stopB();
});

test('failed public refreshes keep prior results, retries refresh immediately, and keys remain isolated', async () => {
  const cache = createPublicResourceCache();
  const original = [{ id: 3 }];
  await cache.load('rooms', () => original);
  await cache.load('rooms', () => { throw new Error('offline'); }, { force: true });
  assert.equal(cache.getSnapshot('rooms').data, original);
  assert.equal(cache.getSnapshot('rooms').error, true);
  assert.equal(cache.getSnapshot('private-stays').data, undefined);
  assert.equal(cache.getServerSnapshot().data, undefined, 'Live API data must not leak into prerendered pages');
  await cache.load('rooms', () => [{ id: 4 }], { force: true });
  assert.equal(cache.getSnapshot('rooms').error, false);
  assert.deepEqual(cache.getSnapshot('rooms').data, [{ id: 4 }]);
});

test('prerender adds active route CSS and preload dependencies without loading optional viewers', () => {
  const manifest = {
    'src/pages/PrivateStays.jsx': { file: 'assets/stays.js', css: ['assets/stays.css'], imports: ['shared'], dynamicImports: ['viewer'] },
    shared: { file: 'assets/shared.js', css: ['assets/shared.css'] },
    viewer: { file: 'assets/viewer.js', css: ['assets/viewer.css'] },
  };
  const template = '<link rel="modulepreload" href="/assets/shared.js">';
  const html = routeAssetTags('/airbnb', manifest, template);
  assert.match(html, /rel="stylesheet"[^>]*stays\.css/);
  assert.match(html, /rel="modulepreload"[^>]*stays\.js/);
  assert.match(html, /shared\.css/);
  assert.doesNotMatch(html, /shared\.js|viewer/);
  assert.equal(routeAssetTags('/', manifest, template), '');
});

test('room photo thumbnails use only the known gallery endpoint and retain external image URLs', () => {
  const [local, external] = unitPhotos({ id: 3, name: 'Suite', images: ['https://api.example.test/api/gallery/files/42/full/', 'https://images.example.test/room.jpg'] });
  assert.equal(local.thumbnail_url, 'https://api.example.test/api/gallery/files/42/thumbnail/');
  assert.equal(local.image_url, 'https://api.example.test/api/gallery/files/42/full/');
  assert.equal(external.thumbnail_url, external.image_url);
});
