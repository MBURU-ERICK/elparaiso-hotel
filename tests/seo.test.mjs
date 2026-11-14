import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalUrl, canonicalPaths, routeAliases, jsonLd, site } from '../src/config/site.js';

test('canonical URLs use the official apex, omit queries/fragments and normalize legacy aliases', () => {
  assert.equal(canonicalUrl(), 'https://elparaisohotelltd.com/');
  assert.equal(canonicalUrl('/rooms/?adults=2#details'), `${site.origin}/rooms`);
  assert.equal(canonicalUrl('/events?occasion=family'), `${site.origin}/events-groups`);
  for (const path of canonicalPaths) assert.equal(new URL(canonicalUrl(path)).hostname, 'elparaisohotelltd.com');
});
test('JSON-LD preserves business text without permitting script termination', () => {
  const content = { name: '</script><script>example</script>', description: 'Rumuruti & Laikipia' };
  const serialized = jsonLd(content);
  assert.ok(!serialized.includes('<'));
  assert.deepEqual(JSON.parse(serialized), content);
});
test('every indexed/legacy route exists and private deep links retain the app shell', async () => {
  const source = await readFile('src/App.jsx', 'utf8');
  for (const route of [...canonicalPaths, ...Object.keys(routeAliases), '/booking', '/review']) assert.ok(source.includes(`path="${route}"`), `Route missing: ${route}`);
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  for (const route of ['/staff/:path*', '/account/:path*', '/review']) assert.ok(config.rewrites.some(rule => rule.source === route && rule.destination === '/app.html'));
  assert.ok(!config.redirects.some(rule => JSON.stringify(rule).includes('elparaisohotel.co.ke')));
  assert.equal(config.trailingSlash, false);
});
